import {useState, useEffect, useRef} from 'react';

const SpinTracker = () => {
    const [speed, setSpeed] = useState(0); // 存储当前速度
    const [cumulate, setCumulate] = useState(0); // 存储累积旋转圈数
    const lastAngle = useRef(null); // 存储上一次鼠标位置的角度
    const totalDeltaAngle = useRef(0); // 存储总角度变化量
    const lastTimestamp = useRef(performance.now()); // 存储上一次事件触发的时间戳
    const spinCenterRef = useRef(null); // 旋转中心元素的ref
    const movementTimeout = useRef(null); // 用于检测鼠标停止移动的timeout,防抖
    useEffect(() => {
        const spinCenter = spinCenterRef.current;
        if (!spinCenter) {
            return;
        }

        const handleMouseMove = (e) => {
            const rect = spinCenter.getBoundingClientRect();//获取元素在窗口种的位置
            const centerX = rect.left + rect.width / 2; // 旋转中心的X坐标
            const centerY = rect.top + rect.height / 2; // 旋转中心的Y坐标
            const mouseX = e.clientX; // 鼠标当前的X坐标
            const mouseY = e.clientY; // 鼠标当前的Y坐标

            const angle = Math.atan2(mouseY - centerY, mouseX - centerX); // Math.atan2计算鼠标相对于旋转中心的角度

            let deltaAngle = 0; // 事件之间角度的变化量

            if (lastAngle.current !== null) {
                deltaAngle = angle - lastAngle.current;

                if (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI;
                if (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI;

                // 仅在顺时针移动时更新
                if (deltaAngle > 0) {
                    totalDeltaAngle.current += deltaAngle;
                    const now = performance.now();
                    const deltaTime = (now - lastTimestamp.current) / 1000; // 计算时间差，单位为秒
                    const currentSpeed = Math.abs(deltaAngle) / (deltaTime * 2 * Math.PI); // 计算当前速度
                    setSpeed(currentSpeed); // 更新速度状态
                    setCumulate(totalDeltaAngle.current / (2 * Math.PI)); // 更新累积旋转圈数
                }
            }

            lastAngle.current = angle; // 更新上一次的角度为当前角度,下一次事件计算使用
            lastTimestamp.current = performance.now(); // 更新上一次事件触发的时间戳
            // 每次移动事件发生时重置检测鼠标停止的计时器
            clearTimeout(movementTimeout.current);
            movementTimeout.current = setTimeout(() => {
                setSpeed(0); // 如果在一定时间内没有新的移动事件，则将速度设置为0
            }, 100); // 100毫秒无移动则假定鼠标已停止
        };
        document.addEventListener('mousemove', handleMouseMove);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            clearTimeout(movementTimeout.current)
        };
    }, []);

    return (
        <div>
            <div ref={spinCenterRef} style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '20px',
                height: '20px',
                backgroundColor: 'blue',
                borderRadius: '50%'
            }}></div>
            <div style={{position: 'fixed', top: '20px', left: '20px'}}>
                <div>
                    Speed: {speed.toFixed(2)}
                </div>
                <div>
                    Cumulate: {cumulate.toFixed(2)}
                </div>
                <div>
                    <button onClick={() => {
                        setCumulate(0);
                        totalDeltaAngle.current = 0
                    }}>clear
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SpinTracker;
