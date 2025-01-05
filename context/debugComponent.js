import { useAnime } from './AnimeContext';

const DebugContext = () => {
  const { topAnime } = useAnime();

  return (
    <div>
      <h2>Debugging Context State</h2>
      <pre>{JSON.stringify(topAnime, null, 2)}</pre>
    </div>
  );
};

export default DebugContext;
