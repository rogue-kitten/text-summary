import useSockets from '@/hooks/useSocket';
import { useSummary } from '@/hooks/useSummary';
import GenerateSummaryForm from './components/generateSummaryForm';
import SummaryGrid from './components/summaryGrid';

function App() {
  const { socketConnection } = useSockets();

  const { socketClient } = socketConnection;

  const { summary } = useSummary({ socketClient });
  return (
    <>
      <GenerateSummaryForm />
      <SummaryGrid items={summary} />
    </>
  );
}

export default App;
