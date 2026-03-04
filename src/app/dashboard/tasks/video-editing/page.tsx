import TaskPageTemplate from '@/components/TaskPageTemplate'

export default function VideoEditingPage() {
    return <TaskPageTemplate
        title="Video Editing"
        emoji="🎬"
        rate="Client Rate Based"
        gradient="linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.03))"
        description="Edit videos for clients ranging from social media reels to corporate presentations. Payment is client-rate based and can be very lucrative for skilled editors. High demand for YouTube, TikTok, and Instagram content creators."
        requirements={[
            'Video editing software (Premiere Pro, DaVinci Resolve, or CapCut)',
            'Understanding of cuts, transitions, and color grading',
            'Audio mixing basic knowledge',
            'Minimum 8GB RAM computer',
            'Portfolio of edited videos',
        ]}
        workflow={[
            'Share your editing skills and software proficiency',
            'Get matched with a suitable client project',
            'Download raw footage from provided link',
            'Edit according to client brief and style guide',
            'Export in required format and resolution',
            'Get feedback, revise, and deliver final cut',
        ]}
        tips={[
            'Create a showreel of your best work',
            'Learn trending styles for Reels and TikTok',
            'Use templates to speed up your workflow',
            'Charge more for same-day delivery',
            'Specialize in one niche to become an expert',
        ]}
    />
}
