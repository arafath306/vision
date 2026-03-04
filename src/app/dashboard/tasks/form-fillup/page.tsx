import TaskPageTemplate from '@/components/TaskPageTemplate'

export default function FormFillupPage() {
    return <TaskPageTemplate
        title="Form Fillup"
        emoji="📝"
        rate="৳150 per project"
        gradient="linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.03))"
        description="Form fillup tasks require filling out online or offline forms with provided information. Simple, repetitive work that is perfect for beginners. Earn ৳150 per completed form set with consistent daily assignments available."
        requirements={[
            'Basic reading and writing skills',
            'Smartphone or computer with internet',
            'Ability to follow instructions precisely',
            'Patience and consistency',
        ]}
        workflow={[
            'Receive form link or physical form from Trainer',
            'Read instructions carefully before starting',
            'Fill in all fields with provided information',
            'Submit the completed form',
            'Take screenshot as proof of submission',
            'Share proof with Trainer to receive payment',
        ]}
        tips={[
            'Always take screenshots after submitting each form',
            'Keep a log of completed forms for reference',
            'Work in batches to maximize efficiency',
            'Never submit incorrect information',
        ]}
    />
}
