import { Routes, Route } from 'react-router-dom';
import Plan from '../pages/user/plan/Plan';
import Create from '../pages/user/plan/create/Create';
import SetTripDetails from '../pages/user/plan/create/Set'
import Preview from '../pages/user/plan/create/Preview'
import MyPlan from '../pages/user/plan/MyPlan'
import Package from '../pages/user/plan/package/Package';
const UserRoutes = () => {
  return (
    <Routes>
      {/* / parent route */}
      <Route index element={<Plan />} />
    
      
      {/* /plan/create renders Create component */}
      <Route path="create" element={<Create />} />
      <Route path="set" element={<SetTripDetails />}/>
      <Route path="preview" element={<Preview/>}/>
      <Route path="myplan" element={<MyPlan/>}/>


      {/**Tour packages path */}
      <Route path="packages" element={<Package/>}/>
     
    </Routes>
  );
};

export default UserRoutes;