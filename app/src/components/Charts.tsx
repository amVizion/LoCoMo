/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Cell,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Scatter,
  ScatterChart,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'



const CHART_MARGIN = { top:20, right:20, bottom:20, left:20 }
const TOOLTIP_STYLE = {backgroundColor:'white', padding:12, borderColor: '1px solid #f5f5f5', color:'black'}
const CustomTooltip = ({ active, payload }: any) => active && <div style={TOOLTIP_STYLE}>
    <strong style={{color:'black'}}> {(payload[0].payload.question || payload[0].payload.text)} </strong>
{/*
    <p> 
      { payload[0].payload.outputKey }: {`${numberFormater(payload[0].payload.target)} (${Math.round(Math.log(payload[0].payload.target))})`} 
      { payload[0].payload.size && <span><br/> Size: {payload[0].payload.size} </span> }
    </p>
  */}
</div>

export const COLORS = [
  '#ff0000',
  '#00ff00',
  '#0000ff',
  '#aa00ff',
  '#00ffff',
  '#ffff00',
]

export const Chart = ({data}:{data:any}) => {

  return <ResponsiveContainer width='100%' height={400}>
    <ScatterChart margin={CHART_MARGIN}>
      <CartesianGrid />
      <XAxis type='number' dataKey='x' />
      <YAxis type='number' dataKey='y' />
      <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip/>} />

      <Scatter data={ data }>
        { data.map((a:any) => <Cell fill={COLORS[a.cluster || 0]} />) }
      </Scatter> 
    </ScatterChart>
  </ResponsiveContainer>
}
