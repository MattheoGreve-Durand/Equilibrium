import { Stage, Layer, Line, Circle, Group, Arrow, Text } from 'react-konva'


export function Force({f})
{
    const Atbeg = f.value > 0 ? false : true;
    const Atend = f.value > 0 ? true : false;

    return(
        <Arrow
          key={f.id}
          x={f.x}
          y={f.y}
          // [xDepart, yDepart, xArrivee, yArrivee]
          // On part de 50px plus haut (0, -50) et on arrive au centre (0, 0)
          points={[0, -50, 0, 0]} 
          pointerLength={10}
          pointerWidth={10}
          fill="red"                  
          stroke="red"
          strokeWidth={2}
          pointerAtBeginning={Atbeg}
          pointerAtEnding={Atend}
        />)
}

export function Beam({b})
{
    return( 
        <Line
          key={b.id}
          points={[b.x1, b.y1, b.x2, b.y2]}
          stroke="#1e293b"
          strokeWidth={4}
          lineCap="square"
        />)
}
