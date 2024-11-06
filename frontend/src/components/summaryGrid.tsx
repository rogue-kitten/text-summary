import { Card, CardContent } from '@/components/ui/card';

interface SummaryGridItemProps {
  chunk: string;
  summary: string;
}

interface SummaryGridProps {
  items: SummaryGridItemProps[];
}

function SummaryGrid({ items = [] }: SummaryGridProps) {
  return (
    <div className='container mx-auto p-4'>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {items.map((item, index) => (
          <Card key={index} className='col-span-1 md:col-span-2'>
            <CardContent className='grid gap-4 p-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <h3 className='text-lg font-semibold text-primary'>Sentence</h3>
                <p className='text-muted-foreground'>{item.chunk}</p>
              </div>
              <div className='space-y-2'>
                <h3 className='text-lg font-semibold text-primary'>Summary</h3>
                <p className='text-muted-foreground'>{item.summary}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default SummaryGrid;
