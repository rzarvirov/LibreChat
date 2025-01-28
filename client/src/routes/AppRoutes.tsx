import { Route, Routes } from 'react-router-dom';
import ManualSubscription from '~/components/Subscription/ManualSubscription';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Manual subscription routes */}
      <Route path="/subscribe/:linkId" element={<ManualSubscription />} />
    </Routes>
  );
};

export default AppRoutes; 