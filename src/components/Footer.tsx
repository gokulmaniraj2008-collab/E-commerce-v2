export default function Footer() {
  return (
    <footer className="bg-ink text-white/70 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <h4 className="text-white font-medium mb-3">Get to know us</h4>
          <ul className="space-y-2">
            <li>About Bazario</li>
            <li>Careers</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-medium mb-3">Sell with us</h4>
          <ul className="space-y-2">
            <li>Become a seller</li>
            <li>Seller hub</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-medium mb-3">Help</h4>
          <ul className="space-y-2">
            <li>Track your order</li>
            <li>Returns &amp; refunds</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-medium mb-3">Policies</h4>
          <ul className="space-y-2">
            <li>Terms of use</li>
            <li>Privacy policy</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/40">
        Built as a demo marketplace prototype.
      </div>
    </footer>
  );
}
