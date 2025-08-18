export default function TestRoute() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Teste de Rota</h1>
      <p>Esta é uma rota de teste fora do grupo (auth)</p>
      <a href="/usuarios" className="text-blue-600 underline">
        Tentar acessar /usuarios
      </a>
    </div>
  );
}