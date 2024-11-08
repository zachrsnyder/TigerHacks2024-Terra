import React from 'react';
import { ResponsivePie } from '@nivo/pie';

const PieChart = ({ data }) => {

    // Convert the data object into an array of objects for nivo/pie chart
    const chartData = data.labels.map((label, index) => ({
        id: label,
        label: label,
        value: data.values[index],
    }));

    //pie chart component
    return (
        <ResponsivePie
            data={chartData}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            innerRadius={0}
            padAngle={0.7}
            cornerRadius={3}
            activeOuterRadiusOffset={8}
            borderWidth={2}
            borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
            enableArcLinkLabels={false}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor="white"
            valueFormat={value => `${value.toLocaleString()} acres`}
            colors={{ scheme: 'category10' }}
        />
    );
};

export default PieChart;