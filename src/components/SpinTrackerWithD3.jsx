import {useState, useEffect, useRef} from 'react';
import * as d3 from 'd3';

const SpinTrackerWithD3 = () => {
    const [speed, setSpeed] = useState(0);
    const [cumulate, setCumulate] = useState(0);
    const lastTimeRef = useRef(null);
    const lastAngleRef = useRef(null);
    const totalDeltaAngleRef = useRef(0);

    // svgRef用于引用SVG元素
    const svgRef = useRef(null);

    useEffect(() => {
        // 设置SVG的宽度和高度
        const width = 300;
        const height = 300;
        // 通过D3选择svg元素，并设置其宽度和高度
        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height);

        // 向SVG中添加一个圆形，作为旋转的中心点
        svg.append('circle')
            .attr('cx', width / 2)
            .attr('cy', height / 2)
            .attr('r', 10)
            .style('fill', 'red');

        // 旋转中心点
        const center = {x: width / 2, y: height / 2};

        // 处理鼠标移动的函数
        const handleMouseMove = (event) => {
            // 计算鼠标相对于SVG元素的位置
            const mouseX = event.clientX - svgRef.current.getBoundingClientRect().left;
            const mouseY = event.clientY - svgRef.current.getBoundingClientRect().top;

            // 计算鼠标位置和旋转中心之间的角度
            const angle = Math.atan2(mouseY - center.y, mouseX - center.x);
            const now = performance.now();

            // 如果有上一次事件的记录
            if (lastTimeRef.current !== null && lastAngleRef.current !== null) {
                // 计算角度变化量
                let deltaAngle = angle - lastAngleRef.current;

                // 确保角度变化量在-π到π之间
                if (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI;
                if (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI;

                // 仅当为顺时针旋转（即deltaAngle为正）时，更新速率和累计圈数
                if (deltaAngle > 0) {
                    const deltaTime = now - lastTimeRef.current;
                    const currentSpeed = deltaAngle / deltaTime;

                    totalDeltaAngleRef.current += deltaAngle;
                    const cumulateRounds = totalDeltaAngleRef.current / (2 * Math.PI);

                    // 更新状态
                    setSpeed(currentSpeed * 1000); // 转换为每秒弧度
                    setCumulate(cumulateRounds);
                }
            }
            // 更新上一次的角度和时间戳为当前值，以供下一次事件使用
            lastAngleRef.current = angle;
            lastTimeRef.current = now;
        };
        // 绑定mousemove事件处理函数到SVG元素
        d3.select(svgRef.current).on('mousemove', handleMouseMove);
        // 组件卸载时，移除mousemove事件监听器
        return () => {
            d3.select(svgRef.current).on('mousemove', null);
        };
    }, []);
    // 渲染SVG元素和显示旋转速率和累计圈数的文本
    return (
        <div>
            <svg ref={svgRef}></svg>
            <div>Speed: {speed.toFixed(2)}</div>
            <div>Cumulate: {cumulate.toFixed(2)}</div>
        </div>
    );
};

export default SpinTrackerWithD3;
