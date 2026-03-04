import TaskPageTemplate from '@/components/TaskPageTemplate'

export default function SocialMediaPage() {
    return <TaskPageTemplate
        title="Social Media Management"
        emoji="📱"
        rate="Package Rate Based"
        gradient="linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.03))"
        description="Manage social media accounts for businesses and influencers. Includes content planning, posting, engagement, and growth strategies. Rates vary based on the number of platforms and posting frequency agreed with the client."
        requirements={[
            'Active presence on major social platforms',
            'Content creation and caption writing skills',
            'Basic graphic design (Canva sufficient)',
            'Understanding of social media algorithms',
            'Consistent availability for daily posting',
        ]}
        workflow={[
            'Define client goals and target audience',
            'Create monthly content calendar',
            'Design posts and write captions in advance',
            'Schedule posts using agreed tools',
            'Respond to comments and messages daily',
            'Provide monthly analytics report to client',
        ]}
        tips={[
            'Batch create content for the whole week at once',
            'Use Buffer or Meta Business Suite for scheduling',
            'Engage authentically to grow organic reach',
            'Track metrics and show growth to retain clients',
            'Start with one platform and expand',
        ]}
    />
}
