import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { AssessmentData } from './pdf'

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
    lastAutoTable: {
      finalY: number
    }
  }
}

interface CompanyInfo {
  name?: string
  logo?: string
}

// Professional color scheme
const COLORS = {
  primary: [54, 83, 186], // Blue
  secondary: [119, 122, 140], // Gray
  success: [72, 187, 120], // Green
  warning: [245, 158, 11], // Orange
  danger: [239, 68, 68], // Red
  light: [243, 244, 246], // Light gray
  dark: [31, 41, 55], // Dark gray
}

function addHeader(doc: jsPDF, title: string, subtitle?: string, pageNum?: number, totalPages?: number) {
  // Header background
  doc.setFillColor(...COLORS.primary)
  doc.rect(0, 0, 210, 35, 'F')

  // Company name/logo area
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('Career Framework', 15, 15)

  // Title
  doc.setFontSize(16)
  doc.setFont('helvetica', 'normal')
  doc.text(title, 15, 25)

  if (subtitle) {
    doc.setFontSize(10)
    doc.setTextColor(200, 200, 200)
    doc.text(subtitle, 15, 31)
  }

  // Page number
  if (pageNum && totalPages) {
    doc.setFontSize(10)
    doc.setTextColor(200, 200, 200)
    doc.text(`Page ${pageNum} of ${totalPages}`, 180, 15, { align: 'right' })
  }

  doc.setTextColor(0, 0, 0) // Reset text color
}

function addFooter(doc: jsPDF, yPos: number) {
  const pageHeight = doc.internal.pageSize.height
  doc.setFillColor(...COLORS.light)
  doc.rect(0, pageHeight - 20, 210, 20, 'F')

  doc.setTextColor(...COLORS.secondary)
  doc.setFontSize(8)
  doc.text(
    `Generated on ${new Date().toLocaleDateString()} | Career Framework Management System`,
    105,
    pageHeight - 10,
    { align: 'center' }
  )

  doc.setTextColor(0, 0, 0) // Reset
}

function getRatingColor(rating: number): number[] {
  if (rating >= 4) return COLORS.success
  if (rating >= 3) return [54, 83, 186] // Blue
  if (rating >= 2) return COLORS.warning
  return COLORS.danger
}

function addRatingBar(doc: jsPDF, x: number, y: number, rating: number, maxRating: number = 5) {
  const barWidth = 30
  const barHeight = 4
  const filledWidth = (rating / maxRating) * barWidth

  // Background
  doc.setFillColor(230, 230, 230)
  doc.rect(x, y, barWidth, barHeight, 'F')

  // Filled portion
  doc.setFillColor(...getRatingColor(rating))
  doc.rect(x, y, filledWidth, barHeight, 'F')

  // Border
  doc.setDrawColor(200, 200, 200)
  doc.rect(x, y, barWidth, barHeight)
}

export function exportEnhancedAssessmentToPDF(data: AssessmentData, companyInfo?: CompanyInfo) {
  const doc = new jsPDF()
  let yPos = 45

  // Page 1: Cover & Summary
  addHeader(doc, 'Career Assessment Report', data.assessmentName, 1, 3)

  // Assessment info box
  doc.setFillColor(...COLORS.light)
  doc.roundedRect(15, yPos, 180, 50, 3, 3, 'F')

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLORS.dark)
  doc.text('Assessment Information', 20, yPos + 8)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...COLORS.secondary)

  const infoLines = [
    `Framework: ${data.frameworkName}`,
    `Employee: ${data.agentName}`,
    `Manager: ${data.managerName}`,
    `Assessment Date: ${data.date}`,
  ]

  infoLines.forEach((line, idx) => {
    doc.text(line, 20, yPos + 18 + idx * 6)
  })

  yPos += 60

  // Summary statistics
  const skillsWithRatings = data.skills.filter(
    (s) => s.selfRating !== undefined && s.managerRating !== undefined
  )

  if (skillsWithRatings.length > 0) {
    const avgSelfRating =
      skillsWithRatings.reduce((sum, s) => sum + (s.selfRating || 0), 0) / skillsWithRatings.length
    const avgManagerRating =
      skillsWithRatings.reduce((sum, s) => sum + (s.managerRating || 0), 0) / skillsWithRatings.length
    const alignmentGap = Math.abs(avgSelfRating - avgManagerRating)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(...COLORS.dark)
    doc.text('Assessment Summary', 15, yPos)
    yPos += 10

    // Summary stats in cards
    const statCards = [
      {
        label: 'Skills Assessed',
        value: skillsWithRatings.length.toString(),
        color: COLORS.primary,
      },
      {
        label: 'Avg Self Rating',
        value: avgSelfRating.toFixed(1),
        color: getRatingColor(avgSelfRating),
      },
      {
        label: 'Avg Manager Rating',
        value: avgManagerRating.toFixed(1),
        color: getRatingColor(avgManagerRating),
      },
      {
        label: 'Alignment Gap',
        value: alignmentGap.toFixed(1),
        color: alignmentGap < 0.5 ? COLORS.success : COLORS.warning,
      },
    ]

    statCards.forEach((card, idx) => {
      const cardX = 15 + idx * 45
      doc.setFillColor(...card.color)
      doc.roundedRect(cardX, yPos, 40, 25, 2, 2, 'F')

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text(card.value, cardX + 20, yPos + 12, { align: 'center' })

      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(card.label, cardX + 20, yPos + 20, { align: 'center' })
    })

    yPos += 35
  }

  // Competency breakdown
  const competencies = [...new Set(data.skills.map((s) => s.competency))]
  yPos += 5

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(...COLORS.dark)
  doc.text('Competency Breakdown', 15, yPos)
  yPos += 5

  const competencyTableData = competencies.map((comp) => {
    const compSkills = data.skills.filter((s) => s.competency === comp)
    const avgSelf =
      compSkills.reduce((sum, s) => sum + (s.selfRating || 0), 0) / compSkills.length
    const avgManager =
      compSkills.reduce((sum, s) => sum + (s.managerRating || 0), 0) / compSkills.length

    return [
      comp,
      compSkills.length.toString(),
      avgSelf.toFixed(1),
      avgManager.toFixed(1),
      Math.abs(avgSelf - avgManager).toFixed(1),
    ]
  })

  doc.autoTable({
    startY: yPos,
    head: [['Competency', 'Skills', 'Self Avg', 'Manager Avg', 'Gap']],
    body: competencyTableData,
    theme: 'grid',
    headStyles: {
      fillColor: COLORS.primary,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: COLORS.dark,
    },
    alternateRowStyles: {
      fillColor: COLORS.light,
    },
  })

  addFooter(doc, yPos)

  // Page 2+: Detailed skill breakdown
  doc.addPage()
  let pageNum = 2
  yPos = 45

  addHeader(doc, 'Detailed Skill Assessment', 'Complete breakdown by competency', pageNum, 3)

  data.skills.forEach((skill, idx) => {
    // Check for new page
    if (yPos > 250) {
      addFooter(doc, yPos)
      doc.addPage()
      pageNum++
      yPos = 45
      addHeader(doc, 'Detailed Skill Assessment', 'Complete breakdown by competency', pageNum, 3)
    }

    // Skill card
    doc.setFillColor(250, 250, 250)
    doc.roundedRect(15, yPos, 180, 45, 2, 2, 'F')

    // Skill name and level
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...COLORS.dark)
    doc.text(skill.skillName, 20, yPos + 8)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...COLORS.secondary)
    doc.text(`${skill.competency} • ${skill.level}`, 20, yPos + 14)

    // Ratings with bars
    if (skill.selfRating !== undefined) {
      doc.setFontSize(9)
      doc.setTextColor(...COLORS.dark)
      doc.text(`Self Rating:`, 20, yPos + 23)
      doc.text(skill.selfRating.toString(), 50, yPos + 23)
      addRatingBar(doc, 60, yPos + 20, skill.selfRating)
    }

    if (skill.managerRating !== undefined) {
      doc.setFontSize(9)
      doc.setTextColor(...COLORS.dark)
      doc.text(`Manager:`, 20, yPos + 31)
      doc.text(skill.managerRating.toString(), 50, yPos + 31)
      addRatingBar(doc, 60, yPos + 28, skill.managerRating)
    }

    // Gap indicator
    if (skill.selfRating !== undefined && skill.managerRating !== undefined) {
      const gap = skill.selfRating - skill.managerRating
      const gapColor = Math.abs(gap) < 1 ? COLORS.success : COLORS.warning
      doc.setFillColor(...gapColor)
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(8)
      const gapText = gap > 0 ? `+${gap}` : gap.toString()
      doc.roundedRect(165, yPos + 5, 25, 8, 1, 1, 'F')
      doc.text(`Gap: ${gapText}`, 177.5, yPos + 10, { align: 'center' })
    }

    yPos += 50

    // Comments section if any
    if (skill.selfComments || skill.managerComments) {
      const commentsHeight = 20 + (skill.selfComments ? 10 : 0) + (skill.managerComments ? 10 : 0)

      if (yPos + commentsHeight > 270) {
        addFooter(doc, yPos)
        doc.addPage()
        pageNum++
        yPos = 45
        addHeader(doc, 'Detailed Skill Assessment', 'Complete breakdown by competency', pageNum, 3)
      }

      doc.setFillColor(255, 255, 255)
      doc.setDrawColor(...COLORS.secondary)
      doc.roundedRect(15, yPos, 180, commentsHeight, 2, 2, 'FD')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(...COLORS.dark)
      doc.text('Comments', 20, yPos + 7)
      yPos += 12

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)

      if (skill.selfComments) {
        doc.setTextColor(...COLORS.secondary)
        doc.text('Self:', 20, yPos)
        doc.setTextColor(...COLORS.dark)
        const selfLines = doc.splitTextToSize(skill.selfComments, 150)
        doc.text(selfLines, 35, yPos)
        yPos += selfLines.length * 4 + 3
      }

      if (skill.managerComments) {
        doc.setTextColor(...COLORS.secondary)
        doc.text('Manager:', 20, yPos)
        doc.setTextColor(...COLORS.dark)
        const managerLines = doc.splitTextToSize(skill.managerComments, 150)
        doc.text(managerLines, 35, yPos)
        yPos += managerLines.length * 4 + 3
      }

      yPos += 5
    }
  })

  addFooter(doc, yPos)

  // Save
  doc.save(`enhanced-assessment-${data.agentName.replace(/\s+/g, '-')}-${Date.now()}.pdf`)
}
