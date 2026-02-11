export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">
            🎂 Welcome to La Fête
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Premium Cake Shop - Artisanal Cakes Delivered Fresh
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="p-6 border rounded-lg">
              <h2 className="text-xl font-semibold mb-2">🛒 E-Commerce</h2>
              <p className="text-gray-600">Browse & order premium cakes</p>
            </div>
            <div className="p-6 border rounded-lg">
              <h2 className="text-xl font-semibold mb-2">💳 Razorpay</h2>
              <p className="text-gray-600">Secure payment gateway</p>
            </div>
            <div className="p-6 border rounded-lg">
              <h2 className="text-xl font-semibold mb-2">🚚 WeFast</h2>
              <p className="text-gray-600">Fast & reliable delivery</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}