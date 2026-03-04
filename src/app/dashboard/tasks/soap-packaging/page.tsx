import TaskPageTemplate from '@/components/TaskPageTemplate'

export default function SoapPackagingPage() {
    return <TaskPageTemplate
        title="Soap Packaging"
        emoji="🧴"
        rate="৳3 per piece"
        gradient="linear-gradient(135deg, rgba(236,72,153,0.15), rgba(236,72,153,0.03))"
        description="Package handmade or manufactured soaps for retail sale. At ৳3 per piece, this is one of the better-paying physical tasks. Work involves wrapping, labeling, and boxing soap bars. Consistent supply guaranteed."
        requirements={[
            'Careful handling skills (soaps are fragile)',
            'Clean working environment',
            'Physical workspace of at least 2x2 meters',
            'Ability to handle at least 100 pieces per day',
            'No skin conditions affecting soap contact',
        ]}
        workflow={[
            'Confirm availability with Trainer',
            'Receive raw soaps and packaging materials',
            'Clean and inspect each soap bar',
            'Wrap according to provided guidelines',
            'Label and box in groups of specified quantity',
            'Arrange for collection and receive payment',
        ]}
        tips={[
            'Handle soaps with clean, dry hands',
            'Work faster by setting up an assembly line at home',
            'Quality control each piece before packing',
            'Increase daily output gradually for more assignments',
            'Store materials in cool, dry conditions',
        ]}
    />
}
