import { useState } from "react";

function Application() {
  const [apps, setApps] = useState<Application[]>([]);
  return (
    <div>
      application
    </div>
  )
}

export default Application;
