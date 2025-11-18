import ExcelJS from 'exceljs'

export interface AssessmentData {
  assessmentName: string
  frameworkName: string
  agentName: string
  managerName: string
  date: string
  skills: {
    competency: string
    skillName: string
    level: string
    selfRating?: number
    managerRating?: number
    selfComments?: string
    managerComments?: string
  }[]
}

export async function exportAssessmentToExcel(data: AssessmentData) {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Assessment')

  // Set column widths
  worksheet.columns = [
    { header: 'Competency', key: 'competency', width: 20 },
    { header: 'Skill', key: 'skill', width: 30 },
    { header: 'Level', key: 'level', width: 15 },
    { header: 'Self Rating', key: 'selfRating', width: 12 },
    { header: 'Manager Rating', key: 'managerRating', width: 15 },
    { header: 'Self Comments', key: 'selfComments', width: 40 },
    { header: 'Manager Comments', key: 'managerComments', width: 40 },
  ]

  // Add header info
  worksheet.insertRow(1, ['Career Assessment Report'])
  worksheet.mergeCells('A1:G1')
  worksheet.getRow(1).font = { size: 16, bold: true }
  worksheet.getRow(1).alignment = { horizontal: 'center' }

  worksheet.insertRow(2, [])
  worksheet.insertRow(3, ['Assessment:', data.assessmentName])
  worksheet.insertRow(4, ['Framework:', data.frameworkName])
  worksheet.insertRow(5, ['Agent:', data.agentName])
  worksheet.insertRow(6, ['Manager:', data.managerName])
  worksheet.insertRow(7, ['Date:', data.date])
  worksheet.insertRow(8, [])

  // Style header rows
  for (let i = 3; i <= 7; i++) {
    worksheet.getRow(i).getCell(1).font = { bold: true }
  }

  // Add data
  const headerRow = 9
  worksheet.insertRow(headerRow, [
    'Competency',
    'Skill',
    'Level',
    'Self Rating',
    'Manager Rating',
    'Self Comments',
    'Manager Comments',
  ])
  worksheet.getRow(headerRow).font = { bold: true }
  worksheet.getRow(headerRow).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  }

  data.skills.forEach((skill) => {
    worksheet.addRow({
      competency: skill.competency,
      skill: skill.skillName,
      level: skill.level,
      selfRating: skill.selfRating || '',
      managerRating: skill.managerRating || '',
      selfComments: skill.selfComments || '',
      managerComments: skill.managerComments || '',
    })
  })

  // Generate buffer and download
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `assessment-${data.agentName.replace(/\s+/g, '-')}-${Date.now()}.xlsx`
  a.click()
  window.URL.revokeObjectURL(url)
}

export async function exportSkillMatrixToExcel(data: {
  userName: string
  skills: {
    competency: string
    skillName: string
    currentLevel: number
    targetLevel: number
    lastAssessed?: string
  }[]
}) {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Skill Matrix')

  // Add header
  worksheet.insertRow(1, ['Skill Matrix Report'])
  worksheet.mergeCells('A1:E1')
  worksheet.getRow(1).font = { size: 16, bold: true }
  worksheet.getRow(1).alignment = { horizontal: 'center' }

  worksheet.insertRow(2, [])
  worksheet.insertRow(3, ['Employee:', data.userName])
  worksheet.insertRow(4, ['Date:', new Date().toLocaleDateString()])
  worksheet.insertRow(5, [])

  // Add data header
  const headerRow = 6
  worksheet.insertRow(headerRow, [
    'Competency',
    'Skill',
    'Current Level',
    'Target Level',
    'Last Assessed',
  ])
  worksheet.getRow(headerRow).font = { bold: true }
  worksheet.getRow(headerRow).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  }

  // Set column widths
  worksheet.columns = [
    { width: 20 },
    { width: 30 },
    { width: 15 },
    { width: 15 },
    { width: 20 },
  ]

  data.skills.forEach((skill) => {
    worksheet.addRow([
      skill.competency,
      skill.skillName,
      skill.currentLevel,
      skill.targetLevel,
      skill.lastAssessed || 'Not assessed',
    ])
  })

  // Generate buffer and download
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `skill-matrix-${data.userName.replace(/\s+/g, '-')}-${Date.now()}.xlsx`
  a.click()
  window.URL.revokeObjectURL(url)
}

// Template for offline assessment completion
export async function exportAssessmentTemplate(data: {
  assessmentName: string
  frameworkName: string
  skills: {
    competency: string
    skillName: string
    level: string
  }[]
}) {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Assessment Template')

  // Instructions
  worksheet.insertRow(1, ['Assessment Template - Instructions'])
  worksheet.mergeCells('A1:F1')
  worksheet.getRow(1).font = { size: 14, bold: true }

  worksheet.insertRow(2, [])
  worksheet.insertRow(3, [
    'Please rate each skill from 1-5 and add comments. Save and upload this file when complete.',
  ])
  worksheet.mergeCells('A3:F3')

  worksheet.insertRow(4, [])
  worksheet.insertRow(5, ['Assessment:', data.assessmentName])
  worksheet.insertRow(6, ['Framework:', data.frameworkName])
  worksheet.insertRow(7, [])

  // Data header
  const headerRow = 8
  worksheet.insertRow(headerRow, [
    'Competency',
    'Skill',
    'Expected Level',
    'Your Rating (1-5)',
    'Your Comments',
  ])
  worksheet.getRow(headerRow).font = { bold: true }
  worksheet.getRow(headerRow).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  }
  worksheet.getRow(headerRow).font = { color: { argb: 'FFFFFFFF' }, bold: true }

  // Set column widths
  worksheet.columns = [
    { width: 20 },
    { width: 30 },
    { width: 15 },
    { width: 15 },
    { width: 50 },
  ]

  // Add skills
  data.skills.forEach((skill) => {
    worksheet.addRow([skill.competency, skill.skillName, skill.level, '', ''])
  })

  // Generate buffer and download
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `assessment-template-${data.assessmentName.replace(/\s+/g, '-')}.xlsx`
  a.click()
  window.URL.revokeObjectURL(url)
}
