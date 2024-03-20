import {useState, useEffect, useRef, useCallback} from 'react';
import {Slider, Button, Box} from "@mui/material";
import ClearIcon from '@mui/icons-material/Clear';
import {damp} from "three/src/math/MathUtils.js";
//three.js中的阻尼函数也可以实现类似效果，看到过别人用它做动画的阻尼效果，但是没有找到详细的API文档
//react-three-fiber框架继承了部分的three.js对应功能，这个很花时间，就不花精力去研究react-three-fiber实现它的原理了

const SpinTracker = () => {
    const [speed, setSpeed] = useState(0); // 存储当前速度
    const [cumulate, setCumulate] = useState(0); // 存储累积旋转圈数
    const lastAngle = useRef(null); // 存储上一次鼠标位置的角度
    const totalDeltaAngle = useRef(0); // 存储总角度变化量
    const lastTimestamp = useRef(performance.now()); // 存储上一次事件触发的时间戳
    const spinCenterRef = useRef(null); // 旋转中心元素的ref
    const movementTimeout = useRef(null); // 用于检测鼠标停止移动的timeout,防抖
    const [damping, setDamping] = useState(0.99) // 阻尼系数
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

                // 仅在顺时针移动时更新，并且应用阻尼
                if (deltaAngle > 0) {
                    totalDeltaAngle.current += deltaAngle;
                    const now = performance.now();
                    const deltaTime = (now - lastTimestamp.current) / 1000; // 计算时间差，单位为秒
                    let currentSpeed = Math.abs(deltaAngle) / (deltaTime * 2 * Math.PI); // 计算当前速度
                    currentSpeed *= Math.pow(damping, deltaTime) //随着时间差的推移逐渐见减小速度，模拟阻尼效果
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
    }, [damping]);
    //这里有点小缺陷，鼠标的移动会更新state引发组件的重新渲染，导致Slider有明显的重新渲染效果
    //其他如Speed, Cumulate感觉不到重新渲染是因为 他们没有UI样式的重新计算
    //已经进行部分优化，功能越来越复杂的话在UI上还会有渲染带来的风险
    //将slider重新封装成一个子组件，用React.memo进行包裹，只由props ->damping控制渲染，这样鼠标的移动 不会改变damping就不影响slider了
    //再改变handledMouseMove中直接更新状态的代码改成间接更新状态，加入防抖 即可优化UI
    //这里渲染的问题跟要解决的问题无关，所以不再对其花时间
    const handleDampingChange = useCallback((e, val) => {
        setDamping(val)
    }, [])

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
            <Box display="flex">
                <div style={{position: 'fixed', top: '20px', left: '20px'}}>
                    <div>
                        Speed: {speed.toFixed(2)}
                    </div>
                    <div>
                        Cumulate: {cumulate.toFixed(2)}
                    </div>
                    <Box>
                        <div>
                            <label>damping factor</label>
                            <Slider
                                aria-label="Damping"
                                value={damping}
                                onChange={handleDampingChange}
                                step={0.01}
                                marks
                                min={0.80}
                                max={0.99}
                                valueLabelDisplay="auto"
                            />
                        </div>
                        <div>
                            <Button variant="contained" size="large" startIcon={<ClearIcon/>} onClick={() => {
                                setCumulate(0);
                                totalDeltaAngle.current = 0
                            }}>clear
                            </Button>
                        </div>
                    </Box>
                </div>
            </Box>
        </div>
    );
};
export default SpinTracker;
