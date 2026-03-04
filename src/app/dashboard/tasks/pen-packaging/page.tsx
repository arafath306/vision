import TaskPageTemplate from '@/components/TaskPageTemplate'

export default function PenPackagingPage() {
    return <TaskPageTemplate
        title="Pen Packaging"
        emoji="🖊️"
        rate="৳1 per piece"
        gradient="linear-gradient(135deg, rgba(6,182,212,0.15), rgba(6,182,212,0.03))"
        description="Package pens for bulk delivery to retailers and wholesalers. Physical task with high volume — fast workers can package 500-800 pens per hour. Materials are provided and collected from/to your location."
        requirements={[
            'Physical fitness and manual dexterity',
            'Available storage space at home',
            'Commitment to quality packaging',
            'Ability to work on consistent daily basis',
            'Located within delivery zone',
        ]}
        workflow={[
            'Register for pen packaging with your Trainer',
            'Materials delivered to your location',
            'Package pens according to specifications',
            'Count and bundle in required quantities',
            'Trainer/team collects finished packages',
            'Payment processed based on piece count',
        ]}
        tips={[
            'Set up an efficient workspace before starting',
            'Work in batches or with family members',
            'Count carefully to avoid payment disputes',
            'Maintain quality — rejected pieces are not paid',
            'High-volume workers get priority assignments',
        ]}
    />
}
