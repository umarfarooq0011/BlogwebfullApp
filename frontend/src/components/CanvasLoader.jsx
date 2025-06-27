import { Html, useProgress } from "@react-three/drei"

export const CanvasLoader = () => {
  const { progress } = useProgress()

  return (
    <Html center zIndexRange={[100, 0]}>
      <div className="flex flex-col justify-center items-center h-screen text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        <p className="mt-4 text-sm text-white font-semibold">
          {progress ? `${progress.toFixed(0)}%` : 'Loading...'}
        </p>
      </div>
    </Html>
  )
}

export default CanvasLoader
