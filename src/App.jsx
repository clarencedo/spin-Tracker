import './App.css'
import SpinTrackerWithD3 from "./components/SpinTrackerWithD3.jsx";
import SpinTrackerThreeJS from "./components/SpinTrackerThreeJs.jsx";
import SpinTracker from "./components/SpinTracker.jsx";

function App() {
 

  return (
    <>
      <div>
        <SpinTracker/>
        <SpinTrackerWithD3/>
        {/*<SpinTrackerThreeJS/>*/}
        </div>
    </>
  )
}

export default App
