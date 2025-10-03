import FactoryGrid from "@/app/components/FactoryGrid";
import {FactoryConfig} from "@/app/types/factory";
import configData from "./factory_config.json";

export default function Home() {
    const tierFiveConfig: FactoryConfig = configData as FactoryConfig;

    return (
        <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center gap-6">
            <h1 className="text-2xl font-bold">Parcel Factory Planner</h1>
            <FactoryGrid config={tierFiveConfig}/>
        </main>
    );
}
