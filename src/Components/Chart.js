import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const Chart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={250} >
      <BarChart data={data}>
        <XAxis dataKey="name" />
        <Tooltip />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#39FF14"/>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default Chart;