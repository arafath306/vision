import TaskPageTemplate from '@/components/TaskPageTemplate'

export default function PhotoEditingPage() {
    return <TaskPageTemplate
        title="Photo Editing"
        emoji="🎨"
        rate="Client Rate Based"
        gradient="linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.03))"
        description="Work on professional photo editing projects for real clients. Rates are determined by project complexity and client budget. Experienced editors earn significantly more. Build your portfolio while earning real income."
        requirements={[
            'Adobe Photoshop or Lightroom proficiency',
            'Understanding of color correction and retouching',
            'Portfolio of previous editing work (for higher-paid projects)',
            'High-resolution monitor recommended',
            'Fast computer for large file processing',
        ]}
        workflow={[
            'Register your editing skills with Trainer',
            'Receive client photo files and instructions',
            'Edit according to client specifications',
            'Submit samples for client approval',
            'Make revisions if requested (1-2 rounds)',
            'Deliver final files and receive payment',
        ]}
        tips={[
            'Build a diverse editing portfolio',
            'Master non-destructive editing techniques',
            'Communicate clearly with clients about scope',
            'Specialize in high-demand niches like product photography',
            'Meet deadlines to get repeat assignments',
        ]}
    />
}
