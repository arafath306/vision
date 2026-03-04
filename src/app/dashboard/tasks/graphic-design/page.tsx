import TaskPageTemplate from '@/components/TaskPageTemplate'

export default function GraphicDesignPage() {
    return <TaskPageTemplate
        title="Graphic Design"
        emoji="✏️"
        rate="৳100 per design"
        gradient="linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.03))"
        description="Create professional graphics for businesses, social media, and marketing materials. At ৳100 per design with unlimited projects available, experienced designers can complete 10-20 designs per day."
        requirements={[
            'Canva, Illustrator, or Photoshop skills',
            'Good design sense and creativity',
            'Understanding of typography and color theory',
            'Ability to follow brand guidelines',
            'Portfolio of design work',
        ]}
        workflow={[
            'Review design brief from Trainer or client',
            'Research competitor designs for inspiration',
            'Create initial design concept',
            'Submit for review and feedback',
            'Revise design based on feedback',
            'Deliver final files in required formats',
        ]}
        tips={[
            'Use Canva for quick turnaround designs',
            'Build templates for recurring design types',
            'Keep up with design trends on Behance and Dribbble',
            'Offer variations to increase approval rate',
            'Complete 10+ designs daily for maximum earnings',
        ]}
    />
}
