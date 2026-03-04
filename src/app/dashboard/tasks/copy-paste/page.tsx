import TaskPageTemplate from '@/components/TaskPageTemplate'

export default function CopyPastePage() {
    return <TaskPageTemplate
        title="Copy Paste Job"
        emoji="📋"
        rate="Per-Task Rate"
        gradient="linear-gradient(135deg, rgba(249,115,22,0.15), rgba(249,115,22,0.03))"
        description="Beginner-friendly copy-paste tasks involving transferring data between documents, websites, or systems. Perfect for new members learning the platform. Consistent daily work available with per-task payment."
        requirements={[
            'Basic computer or smartphone usage',
            'Copy-paste proficiency',
            'Reliable internet connection',
            'Attention to accuracy',
            'No prior experience needed',
        ]}
        workflow={[
            'Receive source material from Trainer',
            'Copy specified content exactly as shown',
            'Paste into the destination system/document',
            'Verify formatting and accuracy',
            'Submit completed batch to Trainer',
            'Get paid per completed task batch',
        ]}
        tips={[
            'Use keyboard shortcuts: Ctrl+C and Ctrl+V',
            'Never modify content unless instructed',
            'Work in batches and submit together',
            'Double-check copied content for accuracy',
            'This is a great starting point — earn while you learn!',
        ]}
    />
}
