import Image from 'next/image'

interface TicketPreviewProps {
  imageUrl: string
}

export function TicketPreview({ imageUrl }: TicketPreviewProps) {
  return (
    <div className="relative w-full h-40">
      <Image
        src={imageUrl}
        alt="Naskenovaná jízdenka"
        fill
        style={{ objectFit: 'contain' }}
      />
    </div>
  )
}

