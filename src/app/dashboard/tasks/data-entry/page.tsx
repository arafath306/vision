import TaskPageTemplate from '@/components/TaskPageTemplate'

export default function DataEntryPage() {
    return <TaskPageTemplate
        title="Data Entry"
        emoji="📊"
        rate="৳700 per project + Bonus"
        gradient="linear-gradient(135deg, rgba(14,165,233,0.15), rgba(14,165,233,0.03))"
        description="Data entry tasks involve entering, updating, or organizing information into spreadsheets, databases, or online systems. This is one of our highest-paying task categories with additional bonus opportunities for fast and accurate work."
        requirements={[
            'Basic computer skills and typing speed',
            'Microsoft Excel or Google Sheets knowledge',
            'Attention to detail and accuracy',
            'Reliable internet connection',
            'Ability to meet deadlines',
        ]}
        workflow={[
            'Receive project files from your Trainer',
            'Review instructions and data format carefully',
            'Enter data accurately into the provided system',
            'Double-check entries for errors',
            'Submit completed work to Trainer for review',
            'Receive payment after approval',
        ]}
        tips={[
            'Work systematically left-to-right, top-to-bottom',
            'Use keyboard shortcuts to speed up entry',
            'Verify data against source documents',
            'Ask your Trainer about bonus criteria upfront',
            'Complete projects early for priority assignments',
        ]}
    />
}
