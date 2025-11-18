import jsPDF from 'jspdf'

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

export function exportAssessmentToPDF(data: AssessmentData) {
  const doc = new jsPDF()

  let yPos = 20

  // Title
  doc.setFontSize(20)
  doc.text('Career Assessment Report', 105, yPos, { align: 'center' })
  yPos += 15

  // Assessment Info
  doc.setFontSize(12)
  doc.text(`Assessment: ${data.assessmentName}`, 20, yPos)
  yPos += 7
  doc.text(`Framework: ${data.frameworkName}`, 20, yPos)
  yPos += 7
  doc.text(`Agent: ${data.agentName}`, 20, yPos)
  yPos += 7
  doc.text(`Manager: ${data.managerName}`, 20, yPos)
  yPos += 7
  doc.text(`Date: ${data.date}`, 20, yPos)
  yPos += 15

  // Skills
  doc.setFontSize(16)
  doc.text('Assessment Results', 20, yPos)
  yPos += 10

  doc.setFontSize(10)
  let currentCompetency = ''

  data.skills.forEach((skill) => {
    // Check if we need a new page
    if (yPos > 270) {
      doc.addPage()
      yPos = 20
    }

    // Competency header
    if (skill.competency !== currentCompetency) {
      currentCompetency = skill.competency
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text(skill.competency, 20, yPos)
      yPos += 7
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
    }

    // Skill details
    doc.text(`• ${skill.skillName} (${skill.level})`, 25, yPos)
    yPos += 6

    if (skill.selfRating !== undefined) {
      doc.text(`  Self Rating: ${skill.selfRating}/5`, 30, yPos)
      yPos += 5
    }

    if (skill.managerRating !== undefined) {
      doc.text(`  Manager Rating: ${skill.managerRating}/5`, 30, yPos)
      yPos += 5
    }

    if (skill.selfComments) {
      const lines = doc.splitTextToSize(`  Self: ${skill.selfComments}`, 160)
      doc.text(lines, 30, yPos)
      yPos += lines.length * 5
    }

    if (skill.managerComments) {
      const lines = doc.splitTextToSize(`  Manager: ${skill.managerComments}`, 160)
      doc.text(lines, 30, yPos)
      yPos += lines.length * 5
    }

    yPos += 3
  })

  // Save the PDF
  doc.save(`assessment-${data.agentName.replace(/\s+/g, '-')}-${Date.now()}.pdf`)
}

export function exportSkillMatrixToPDF(data: {
  userName: string
  skills: {
    competency: string
    skillName: string
    currentLevel: number
    targetLevel: number
    lastAssessed?: string
  }[]
}) {
  const doc = new jsPDF()

  let yPos = 20

  // Title
  doc.setFontSize(20)
  doc.text('Skill Matrix Report', 105, yPos, { align: 'center' })
  yPos += 15

  doc.setFontSize(12)
  doc.text(`Employee: ${data.userName}`, 20, yPos)
  yPos += 7
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, yPos)
  yPos += 15

  // Skills
  doc.setFontSize(16)
  doc.text('Skills Overview', 20, yPos)
  yPos += 10

  doc.setFontSize(10)
  let currentCompetency = ''

  data.skills.forEach((skill) => {
    if (yPos > 270) {
      doc.addPage()
      yPos = 20
    }

    if (skill.competency !== currentCompetency) {
      currentCompetency = skill.competency
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text(skill.competency, 20, yPos)
      yPos += 7
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
    }

    doc.text(`• ${skill.skillName}`, 25, yPos)
    yPos += 6
    doc.text(`  Current: Level ${skill.currentLevel} | Target: Level ${skill.targetLevel}`, 30, yPos)
    yPos += 5

    if (skill.lastAssessed) {
      doc.text(`  Last Assessed: ${skill.lastAssessed}`, 30, yPos)
      yPos += 5
    }

    yPos += 3
  })

  doc.save(`skill-matrix-${data.userName.replace(/\s+/g, '-')}-${Date.now()}.pdf`)
}
