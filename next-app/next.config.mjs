/** @type {import('next').NextConfig} */
const nextConfig = {
	// Configuration pour Next.js 15
	eslint: {
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	// Éviter les erreurs de build liées à la DB
	serverExternalPackages: ['@prisma/client', 'prisma']
};

export default nextConfig;
