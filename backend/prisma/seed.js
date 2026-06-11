import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('123456', 10);

  const company = await prisma.company.upsert({
    where: { cnpj: '00.000.000/0001-00' },
    update: {},
    create: {
      legalName: 'Empresa Demonstração de Segurança LTDA',
      tradeName: 'Demo SST',
      cnpj: '00.000.000/0001-00',
      cnae: '4399-1/99',
      riskLevel: 'Grau de risco 3',
      address: 'Rua da Segurança, 100',
      city: 'Paracatu',
      state: 'MG',
      corporateEmail: 'teste@empresa.com',
      phone: '(38) 99999-0000',
      legalResponsible: 'Responsável Legal Demo',
      legalResponsibleCpf: '000.000.000-00',
      sstResponsible: 'Denyuender - Técnico de Segurança',
      sstResponsibleRole: 'Técnico em Segurança do Trabalho',
      signatureMethod: 'Aceite eletrônico com identificação do colaborador',
      epiPolicy: 'Entrega mediante registro eletrônico, ciência do colaborador e controle de CA.'
    }
  });

  await prisma.user.upsert({
    where: { email: 'teste@empresa.com' },
    update: {},
    create: {
      name: 'Administrador Demo',
      email: 'teste@empresa.com',
      passwordHash,
      role: 'ADMIN',
      companyId: company.id
    }
  });

  const employees = [
    { fullName: 'Lucas Santos', cpf: '111.111.111-11', registration: 'MAT-001', role: 'Técnico', department: 'Manutenção', admissionDate: '2024-01-10' },
    { fullName: 'Marcos Silva', cpf: '222.222.222-22', registration: 'MAT-002', role: 'Mecânico', department: 'Oficina', admissionDate: '2023-08-22' },
    { fullName: 'Ana Júlia', cpf: '333.333.333-33', registration: 'MAT-003', role: 'Eletricista', department: 'Elétrica', admissionDate: '2025-02-05' }
  ];

  for (const employee of employees) {
    await prisma.employee.upsert({
      where: { cpf_companyId: { cpf: employee.cpf, companyId: company.id } },
      update: {},
      create: { ...employee, companyId: company.id }
    });
  }

  const epis = [
    { name: 'Bota de Segurança', category: 'Calçado', caNumber: '12345', caValidity: '2026-12-31', manufacturer: 'SafetyPro', size: 'Diversos', currentQuantity: 47, minimumQuantity: 10 },
    { name: 'Luva de Vaqueta', category: 'Proteção das mãos', caNumber: '9876', caValidity: '2026-08-20', manufacturer: 'ProtecLuva', size: 'G', currentQuantity: 8, minimumQuantity: 20 },
    { name: 'Capacete com Jugular', category: 'Proteção da cabeça', caNumber: '4567', caValidity: '2027-03-15', manufacturer: 'HeadSafe', size: 'Único', currentQuantity: 12, minimumQuantity: 15 }
  ];

  for (const epi of epis) {
    await prisma.epi.upsert({
      where: { caNumber_name_companyId: { caNumber: epi.caNumber, name: epi.name, companyId: company.id } },
      update: {},
      create: { ...epi, companyId: company.id }
    });
  }

  console.log('Seed concluído. Login: teste@empresa.com | senha: 123456');
}

main().finally(() => prisma.$disconnect());
