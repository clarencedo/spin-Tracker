import {useRef, useEffect, useState} from 'react';
import * as THREE from 'three';

const SpinTrackerThreeJS = () => {
    const mountRef = useRef(null); // 用于引用渲染器挂载点的ref
    const [speed, setSpeed] = useState(0); // 存储计算得出的速度
    const [cumulate, setCumulate] = useState(0); // 存储累计的圈数
    const rotationRef = useRef({lastAngle: 0, totalRotation: 0}); // 存储上一次角度和总旋转角度
    const speedTimeoutRef = useRef(null); // 存储用于重置速度的timeout引用

    useEffect(() => {
        const width = 600; // 场景宽度
        const height = 400; // 场景高度
        const scene = new THREE.Scene(); // 创建场景
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000); // 创建相机
        camera.position.z = 5; // 设置相机位置

        const renderer = new THREE.WebGLRenderer({antialias: true}); // 创建渲染器，并开启抗锯齿
        renderer.setSize(width, height); // 设置渲染器大小
        mountRef.current.appendChild(renderer.domElement); // 将渲染器的DOM元素挂载到React的ref对应的DOM元素上

        const geometry = new THREE.SphereGeometry(1, 32, 32); // 创建球体几何体
        const material = new THREE.MeshPhongMaterial({color: 0xff4500, specular: 0x111111, shininess: 100}); // 创建材质
        const sphere = new THREE.Mesh(geometry, material); // 创建网格模型
        scene.add(sphere); // 将球体添加到场景中

        const light = new THREE.PointLight(0xffffff, 1); // 创建点光源
        light.position.set(25, 50, 25); // 设置光源位置
        scene.add(light); // 将光源添加到场景中

        scene.add(new THREE.AmbientLight(0x404040)); // 添加环境光

        const animate = () => {
            requestAnimationFrame(animate); // 请求动画帧
            renderer.render(scene, camera); // 渲染场景
        };
        animate(); // 开始动画循环

        const handleMouseMove = (event) => {
            const rect = mountRef.current.getBoundingClientRect(); // 获取渲染器元素的位置和尺寸
            const mouseX = event.clientX - rect.left; // 计算鼠标在渲染器内的X坐标
            const mouseY = event.clientY - rect.top; // 计算鼠标在渲染器内的Y坐标
            const angle = Math.atan2(mouseY - height / 2, mouseX - width / 2); // 计算鼠标位置相对于场景中心的角度

            let deltaAngle = angle - rotationRef.current.lastAngle; // 计算角度变化量
            // 处理角度跳变的情况
            if (deltaAngle > Math.PI) {
                deltaAngle -= 2 * Math.PI;
            } else if (deltaAngle < -Math.PI) {
                deltaAngle += 2 * Math.PI;
            }

            // 仅当为顺时针旋转时更新速度和累计圈数
            if (deltaAngle > 0) {
                rotationRef.current.totalRotation += deltaAngle; // 更新总旋转角度
                const rotations = rotationRef.current.totalRotation / (2 * Math.PI); // 将总旋转角度转换为圈数
                setCumulate(rotations); // 更新累计圈数
                setSpeed(deltaAngle / (2 * Math.PI)); // 更新速度，这里简化处理，将角度变化直接视为速度
            }

            // 如果鼠标停止移动，一段时间后重置速度
            clearTimeout(speedTimeoutRef.current); // 清除之前的timeout
            speedTimeoutRef.current = setTimeout(() => {
                setSpeed(0); // 重置速度为0
            }, 100); // 设置延时

            rotationRef.current.lastAngle = angle; // 更新上一次的角度
        };

        window.addEventListener('mousemove', handleMouseMove); // 添加鼠标移动事件监听器

        return () => {
            window.removeEventListener('mousemove', handleMouseMove); // 清理：移除事件监听器
            mountRef.current.removeChild(renderer.domElement); // 清理：移除渲染器的DOM元素
        };
    }, []);

    return (
        <div ref={mountRef} style={{width: '100vw', height: '100vh'}}>
            <div>Speed: {speed.toFixed(3)} </div>
            <div>Cumulate: {cumulate.toFixed(3)} </div>
        </div>
    );
};

export default SpinTrackerThreeJS;
