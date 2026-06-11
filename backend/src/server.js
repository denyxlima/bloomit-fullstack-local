import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pkg from '@prisma/client';

const { PrismaClient } = pkg;

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3333;
const JWT_SECRET = process.env.JWT_SECRET || 'local-secret';

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '2mb' }));

function signToken(user) {
  return jwt.sign({ userId: user.id, companyId: user.companyId, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Token não informado.' });
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.userId }, include: { company: true } });
    if (!user || !user.active) return res.status(401).json({ message: 'Usuário inválido.' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Sessão inválida ou expirada.' });
  }
}

async function audit({ req, action, entity, entityId, beforeData, afterData }) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId,
        beforeData: beforeData ? JSON.stringify(beforeData) : null,
        afterData: afterData ? JSON.stringify(afterData) : null,
        companyId: req.user.companyId,
        userId: req.user.id
      }
    });
  } catch (error) {
    console.error('Erro audit log:', error.message);
  }
}

app.get('/api/health', (req, res) => res.json({ ok: true, name: 'Bloomit API Local' }));

app.post('/api/auth/register', async (req, res) => {
  try {
    const { company, user } = req.body;
    if (!company?.legalName || !company?.cnpj || !user?.name || !user?.email || !user?.password) {
      return res.status(400).json({ message: 'Preencha empresa, CNPJ, nome, e-mail e senha.' });
    }

    const existsCompany = await prisma.company.findUnique({ where: { cnpj: company.cnpj } });
    if (existsCompany) return res.status(409).json({ message: 'CNPJ já cadastrado.' });

    const existsUser = await prisma.user.findUnique({ where: { email: user.email } });
    if (existsUser) return res.status(409).json({ message: 'E-mail já cadastrado.' });

    const passwordHash = await bcrypt.hash(user.password, 10);

    const created = await prisma.company.create({
      data: {
        legalName: company.legalName,
        tradeName: company.tradeName || null,
        cnpj: company.cnpj,
        cnae: company.cnae || null,
        riskLevel: company.riskLevel || null,
        address: company.address || null,
        city: company.city || null,
        state: company.state || null,
        phone: company.phone || null,
        corporateEmail: company.corporateEmail || user.email,
        legalResponsible: company.legalResponsible || null,
        legalResponsibleCpf: company.legalResponsibleCpf || null,
        sstResponsible: company.sstResponsible || null,
        sstResponsibleRole: company.sstResponsibleRole || null,
        signatureMethod: company.signatureMethod || 'Aceite eletrônico com identificação do colaborador',
        epiPolicy: company.epiPolicy || 'Entrega de EPI mediante registro eletrônico, controle de CA, validade e aceite do colaborador.',
        controlsCaValidity: Boolean(company.controlsCaValidity ?? true),
        storesEvidence: Boolean(company.storesEvidence ?? true),
        users: {
          create: {
            name: user.name,
            email: user.email,
            passwordHash,
            role: 'ADMIN'
          }
        }
      },
      include: { users: true }
    });

    const admin = created.users[0];
    const token = signToken(admin);
    res.status(201).json({ token, user: { id: admin.id, name: admin.name, email: admin.email, role: admin.role }, company: created });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao cadastrar empresa.', detail: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email }, include: { company: true } });
    if (!user) return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
    const token = signToken(user);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role }, company: user.company });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao fazer login.', detail: error.message });
  }
});

app.get('/api/auth/me', auth, async (req, res) => {
  res.json({ user: { id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role }, company: req.user.company });
});

app.get('/api/dashboard', auth, async (req, res) => {
  const companyId = req.user.companyId;
  const [employees, epis, deliveries, requests, pendingDeliveries, allEpis] = await Promise.all([
    prisma.employee.count({ where: { companyId, active: true } }),
    prisma.epi.count({ where: { companyId, active: true } }),
    prisma.delivery.count({ where: { companyId } }),
    prisma.epiRequest.count({ where: { companyId } }),
    prisma.delivery.count({ where: { companyId, status: 'PENDING' } }),
    prisma.epi.findMany({ where: { companyId, active: true } })
  ]);

  const lowStock = allEpis.filter(e => e.currentQuantity <= e.minimumQuantity).length;
  res.json({ employees, epis, deliveries, requests, lowStock, pendingDeliveries });
});

app.get('/api/company/me', auth, async (req, res) => res.json(req.user.company));

app.put('/api/company/me', auth, async (req, res) => {
  const before = req.user.company;
  const updated = await prisma.company.update({ where: { id: req.user.companyId }, data: req.body });
  await audit({ req, action: 'Atualizou dados da empresa', entity: 'Company', entityId: updated.id, beforeData: before, afterData: updated });
  res.json(updated);
});

app.get('/api/employees', auth, async (req, res) => {
  const data = await prisma.employee.findMany({ where: { companyId: req.user.companyId }, orderBy: { createdAt: 'desc' } });
  res.json(data);
});

app.post('/api/employees', auth, async (req, res) => {
  try {
    const { fullName, cpf } = req.body;
    if (!fullName || !cpf) return res.status(400).json({ message: 'Nome completo e CPF são obrigatórios.' });
    const created = await prisma.employee.create({ data: { ...req.body, companyId: req.user.companyId } });
    await audit({ req, action: 'Cadastrou colaborador', entity: 'Employee', entityId: created.id, afterData: created });
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao cadastrar colaborador.', detail: error.message });
  }
});

app.put('/api/employees/:id', auth, async (req, res) => {
  const before = await prisma.employee.findFirst({ where: { id: req.params.id, companyId: req.user.companyId } });
  if (!before) return res.status(404).json({ message: 'Colaborador não encontrado.' });
  const updated = await prisma.employee.update({ where: { id: req.params.id }, data: req.body });
  await audit({ req, action: 'Atualizou colaborador', entity: 'Employee', entityId: updated.id, beforeData: before, afterData: updated });
  res.json(updated);
});

app.get('/api/epis', auth, async (req, res) => {
  const data = await prisma.epi.findMany({ where: { companyId: req.user.companyId }, orderBy: { createdAt: 'desc' } });
  res.json(data);
});

app.post('/api/epis', auth, async (req, res) => {
  try {
    const { name, caNumber } = req.body;
    if (!name || !caNumber) return res.status(400).json({ message: 'Nome do EPI e CA são obrigatórios.' });
    const created = await prisma.epi.create({ data: { ...req.body, currentQuantity: Number(req.body.currentQuantity || 0), minimumQuantity: Number(req.body.minimumQuantity || 0), companyId: req.user.companyId } });
    if (created.currentQuantity > 0) {
      await prisma.stockMovement.create({ data: { type: 'ENTRADA', quantity: created.currentQuantity, reason: 'Estoque inicial', epiId: created.id, companyId: req.user.companyId, userId: req.user.id } });
    }
    await audit({ req, action: 'Cadastrou EPI/mercadoria', entity: 'Epi', entityId: created.id, afterData: created });
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao cadastrar EPI.', detail: error.message });
  }
});

app.put('/api/epis/:id', auth, async (req, res) => {
  const before = await prisma.epi.findFirst({ where: { id: req.params.id, companyId: req.user.companyId } });
  if (!before) return res.status(404).json({ message: 'EPI não encontrado.' });
  const updated = await prisma.epi.update({ where: { id: req.params.id }, data: { ...req.body, currentQuantity: req.body.currentQuantity !== undefined ? Number(req.body.currentQuantity) : undefined, minimumQuantity: req.body.minimumQuantity !== undefined ? Number(req.body.minimumQuantity) : undefined } });
  await audit({ req, action: 'Atualizou EPI/mercadoria', entity: 'Epi', entityId: updated.id, beforeData: before, afterData: updated });
  res.json(updated);
});

app.get('/api/stock/movements', auth, async (req, res) => {
  const data = await prisma.stockMovement.findMany({ where: { companyId: req.user.companyId }, include: { epi: true, user: { select: { name: true } } }, orderBy: { createdAt: 'desc' } });
  res.json(data);
});

app.post('/api/stock/movements', auth, async (req, res) => {
  try {
    const { epiId, type, quantity, reason } = req.body;
    const qty = Number(quantity);
    if (!epiId || !type || !qty) return res.status(400).json({ message: 'EPI, tipo e quantidade são obrigatórios.' });
    const epi = await prisma.epi.findFirst({ where: { id: epiId, companyId: req.user.companyId } });
    if (!epi) return res.status(404).json({ message: 'EPI não encontrado.' });
    const delta = type === 'SAIDA' ? -qty : qty;
    if (epi.currentQuantity + delta < 0) return res.status(400).json({ message: 'Estoque insuficiente.' });
    const movement = await prisma.stockMovement.create({ data: { epiId, type, quantity: qty, reason, companyId: req.user.companyId, userId: req.user.id } });
    const updated = await prisma.epi.update({ where: { id: epiId }, data: { currentQuantity: epi.currentQuantity + delta } });
    await audit({ req, action: `Movimentou estoque: ${type}`, entity: 'StockMovement', entityId: movement.id, afterData: { movement, updated } });
    res.status(201).json({ movement, epi: updated });
  } catch (error) {
    res.status(400).json({ message: 'Erro ao movimentar estoque.', detail: error.message });
  }
});

app.get('/api/requests', auth, async (req, res) => {
  const data = await prisma.epiRequest.findMany({ where: { companyId: req.user.companyId }, include: { employee: true, epi: true }, orderBy: { createdAt: 'desc' } });
  res.json(data);
});

app.post('/api/requests', auth, async (req, res) => {
  try {
    const { employeeId, epiId, reason, observation } = req.body;
    if (!employeeId || !epiId) return res.status(400).json({ message: 'Colaborador e EPI são obrigatórios.' });
    const created = await prisma.epiRequest.create({ data: { employeeId, epiId, reason, observation, companyId: req.user.companyId } });
    await audit({ req, action: 'Criou solicitação de EPI', entity: 'EpiRequest', entityId: created.id, afterData: created });
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao criar solicitação.', detail: error.message });
  }
});

app.put('/api/requests/:id/status', auth, async (req, res) => {
  const { status } = req.body;
  const before = await prisma.epiRequest.findFirst({ where: { id: req.params.id, companyId: req.user.companyId } });
  if (!before) return res.status(404).json({ message: 'Solicitação não encontrada.' });
  const updated = await prisma.epiRequest.update({ where: { id: req.params.id }, data: { status } });
  await audit({ req, action: 'Atualizou status da solicitação', entity: 'EpiRequest', entityId: updated.id, beforeData: before, afterData: updated });
  res.json(updated);
});

app.get('/api/deliveries', auth, async (req, res) => {
  const data = await prisma.delivery.findMany({ where: { companyId: req.user.companyId }, include: { employee: true, epi: true, deliveredByUser: { select: { name: true } } }, orderBy: { createdAt: 'desc' } });
  res.json(data);
});

app.post('/api/deliveries', auth, async (req, res) => {
  try {
    const { employeeId, epiId, quantity, reason, signedByName, signedByCpf, accepted } = req.body;
    const qty = Number(quantity || 1);
    if (!employeeId || !epiId) return res.status(400).json({ message: 'Colaborador e EPI são obrigatórios.' });
    const epi = await prisma.epi.findFirst({ where: { id: epiId, companyId: req.user.companyId } });
    if (!epi) return res.status(404).json({ message: 'EPI não encontrado.' });
    if (epi.currentQuantity < qty) return res.status(400).json({ message: 'Estoque insuficiente para entrega.' });

    const delivery = await prisma.delivery.create({
      data: {
        employeeId,
        epiId,
        quantity: qty,
        reason,
        status: accepted ? 'SIGNED' : 'PENDING',
        acceptanceText: accepted ? 'Colaborador declara ter recebido, sido orientado quanto ao uso, guarda e conservação do EPI.' : null,
        signedByName: accepted ? signedByName : null,
        signedByCpf: accepted ? signedByCpf : null,
        signedAt: accepted ? new Date() : null,
        deviceInfo: req.headers['user-agent'] || 'Local',
        companyId: req.user.companyId,
        deliveredByUserId: req.user.id
      }
    });

    await prisma.epi.update({ where: { id: epiId }, data: { currentQuantity: epi.currentQuantity - qty } });
    await prisma.stockMovement.create({ data: { type: 'SAIDA', quantity: qty, reason: `Entrega de EPI: ${reason || 'sem motivo informado'}`, epiId, companyId: req.user.companyId, userId: req.user.id } });
    await audit({ req, action: 'Registrou entrega de EPI', entity: 'Delivery', entityId: delivery.id, afterData: delivery });
    res.status(201).json(delivery);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao registrar entrega.', detail: error.message });
  }
});

app.put('/api/deliveries/:id/sign', auth, async (req, res) => {
  const before = await prisma.delivery.findFirst({ where: { id: req.params.id, companyId: req.user.companyId } });
  if (!before) return res.status(404).json({ message: 'Entrega não encontrada.' });
  const updated = await prisma.delivery.update({ where: { id: req.params.id }, data: { status: 'SIGNED', signedByName: req.body.signedByName, signedByCpf: req.body.signedByCpf, acceptanceText: 'Colaborador declara ter recebido, sido orientado quanto ao uso, guarda e conservação do EPI.', signedAt: new Date(), deviceInfo: req.headers['user-agent'] || 'Local' } });
  await audit({ req, action: 'Assinou entrega de EPI', entity: 'Delivery', entityId: updated.id, beforeData: before, afterData: updated });
  res.json(updated);
});

app.get('/api/audit-logs', auth, async (req, res) => {
  const data = await prisma.auditLog.findMany({ where: { companyId: req.user.companyId }, include: { user: { select: { name: true, email: true } } }, orderBy: { createdAt: 'desc' }, take: 100 });
  res.json(data);
});

app.listen(PORT, () => {
  console.log(`Bloomit API Local rodando em http://localhost:${PORT}`);
});
