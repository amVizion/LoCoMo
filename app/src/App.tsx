import { Chart } from './components/Charts'
import 'bulma/css/bulma.css'
import './App.css'

import DATA from './data/data.json'
import EMBEDDINGS from './data/embeddings.json'


const App = () => <div className='section content' style={{}}>
    <Chart data={DATA} />
    <Chart data={EMBEDDINGS} />
</div>

export default App
