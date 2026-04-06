export default function Page({ params }: { params: { token: string } }) {
  return (
    <div>
      <h1>{params.token}</h1>
    </div>
  )
}