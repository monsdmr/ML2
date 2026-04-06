import { useIsMobile } from "@/hooks/use-mobile";

const MobileOnly = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile();

  if (isMobile === undefined) return null; // loading

  if (!isMobile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-8">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">📱</div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Sitio solo para móviles
          </h1>
          <p className="text-muted-foreground">
            Este sitio está diseñado exclusivamente para dispositivos móviles. Por favor, accedé desde tu celular.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default MobileOnly;
