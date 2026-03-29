import { Users, FileText, AlertTriangle, Home } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import StatCard from "@/components/dashboard/StatCard";
import React, { Suspense, lazy } from "react";
const RecentActivity = lazy(() => import("@/components/dashboard/RecentActivity"));
const PopulationChart = lazy(() => import("@/components/dashboard/PopulationChart"));
const DocumentStats = lazy(() => import("@/components/dashboard/DocumentStats"));
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";


const stats = [
	{
		title: "Total Residents",
		value: 2400,
		icon: Users,
		trend: { value: 5.2, isPositive: true },
		variant: "primary" as const,
	},
	{
		title: "Households",
		value: 568,
		icon: Home,
		trend: { value: 2.1, isPositive: true },
		variant: "secondary" as const,
	},
	{
		title: "Documents Issued",
		value: 335,
		icon: FileText,
		trend: { value: 12.5, isPositive: true },
		variant: "default" as const,
	},
	{
		title: "Active Blotters",
		value: 8,
		icon: AlertTriangle,
		trend: { value: 3, isPositive: false },
		variant: "default" as const,
	},
];

const Index = () => {
	const navigate = useNavigate();
	const { switchRole } = useAuth();

// Database is now handled by backend API

	const handleRoleSelection = (selectedRole: "admin" | "user") => {
		// Clear any existing role and set new one
		switchRole(selectedRole);
		// Navigate to the selected portal
		navigate(selectedRole === "admin" ? "/admin" : "/user", { replace: true });
	};

	return (
		<MainLayout>
			<div className="space-y-6">
				{/* Page Header */}
				<div className="animate-fade-in">
					<h1 className="font-heading text-2xl font-bold text-foreground">
						Dashboard
					</h1>
					<p className="text-muted-foreground">
						Welcome to Barangay Information System
					</p>
				</div>

				{/* Stats Grid */}
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
					{stats.map((stat, index) => (
						<div
							key={stat.title}
							style={{ animationDelay: `${index * 100}ms` }}
						>
							<StatCard {...stat} />
						</div>
					))}
				</div>

				{/* Charts Row */}
			{isInitialized && (
				<div className="grid gap-6 lg:grid-cols-2">
					<Suspense fallback={<div className="p-6"><p>Loading chart…</p></div>}>
						<PopulationChart />
					</Suspense>
					<Suspense fallback={<div className="p-6"><p>Loading stats…</p></div>}>
						<DocumentStats />
					</Suspense>
				</div>
			)}

			{/* Recent Activity */}
			{isInitialized && (
				<Suspense fallback={<div className="p-6"><p>Loading activity…</p></div>}>
					<RecentActivity />
				</Suspense>
			)}
				{/* Navigation Buttons */}
				<div className="flex flex-col sm:flex-row gap-4 my-6">
					<Button 
						onClick={() => navigate("/login")}
						variant="outline"
						className="border border-input"
					>
						Login
					</Button>
					<Button 
						onClick={() => navigate("/signup")}
						variant="outline"
						className="border border-input"
					>
						Sign Up
					</Button>
					<Button 
						onClick={() => navigate("/user/request-services")}
						className="border border-input"
					>
						Request Documents & Services
					</Button>
					<Button 
						onClick={() => handleRoleSelection("user")}
						variant="outline"
						>
							User Portal
						</Button>
						<Button 
							onClick={() => handleRoleSelection("admin")}
						>
							Admin Dashboard
						</Button>
				</div>
			</div>
		</MainLayout>
	);
};

export default Index;

