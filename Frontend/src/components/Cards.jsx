
import { motion } from 'motion/react'
const Cards = ({image, style, containerRef}) => {
  return (

        <motion.img className="absolute w-15  cursor-grab " src={image} style={style}
        whileHover={{scale:1.05}}
        drag
        dragConstraints={containerRef}
        />
  
   
  )
}

export default Cards