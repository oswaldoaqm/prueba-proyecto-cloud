# LLM Management Platform

A modern, feature-rich web application for managing Large Language Models (LLMs) and ML operations. Built with **React**, **TypeScript**, **Vite**, and **Tailwind CSS**.

## 🎯 Features

- **Dashboard**: Real-time KPIs and top model performance metrics
- **Feature Catalog**: Browse and filter features by type with pagination
- **Model Registry**: Comprehensive model management with filtering by framework and state
- **Prediction Simulator**: Test inferences with custom input parameters
- **Logs Management**: View and search prediction logs by model
- **Analytics**: Framework analysis, data drift monitoring, and volume metrics

## 🏗️ Project Structure

```
src/
├── components/
│   ├── tabs/
│   │   ├── Dashboard.tsx      # Dashboard tab component
│   │   ├── Features.tsx       # Features catalog tab
│   │   ├── Models.tsx         # Model registry tab
│   │   ├── Predict.tsx        # Prediction simulator tab
│   │   ├── Logs.tsx           # Logs viewer tab
│   │   └── Analytics.tsx      # Analytics dashboard tab
│   ├── Header.tsx             # Main header component
│   ├── Navigation.tsx         # Navigation tabs
│   ├── Card.tsx               # Reusable card wrapper
│   ├── KPICard.tsx            # KPI metric card
│   ├── DataTable.tsx          # Data table with sorting
│   ├── Badge.tsx              # Status badge component
│   ├── Pagination.tsx         # Pagination controls
│   └── index.ts               # Component exports
├── services/
│   └── api.ts                 # API service with all microservice calls
├── types/
│   └── index.ts               # TypeScript interfaces and types
├── constants/
│   └── index.ts               # Configuration and constants
├── styles/
│   └── globals.css            # Global Tailwind styles
├── App.tsx                    # Main app component
└── main.tsx                   # React entry point

Configuration Files:
├── vite.config.ts             # Vite configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── postcss.config.js          # PostCSS plugins
├── tsconfig.json              # TypeScript configuration
├── tsconfig.node.json         # TypeScript config for Vite
├── index.html                 # HTML entry point
└── package.json               # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

The app will be available at `http://localhost:5173`

## 🔌 API Integration

The platform integrates with 5 microservices:

| Microservice | Port | Purpose |
|---|---|---|
| MS1 | 8001 | Feature Store |
| MS2 | 8002 | Model Registry |
| MS3 | 8003 | Prediction Logs |
| MS4 | 8004 | Inference Engine |
| MS5 | 8005 | Analytics |

Update the API base URLs in `src/constants/index.ts` if your microservices run on different ports.

## 🎨 Design System

### Color Palette (Minimalistic & Professional)
- **Background**: `#0f172a` (Deep Navy)
- **Primary**: `#38bdf8` (Cyan Blue)
- **Secondary**: `#818cf8` (Indigo)
- **Accent**: `#34d399` (Emerald Green)
- **Muted**: `#94a3b8` (Slate Gray)
- **Border**: `#334155` (Dark Gray)
- **Card**: `#1e293b` (Darker Navy)

### Typography
- **Font Family**: Segoe UI, Tahoma, Geneva, Verdana, sans-serif
- **Headings**: Bold, large (2xl-4xl)
- **Body**: Regular, medium (14px-16px)

## 📊 Key Components

### KPI Cards
Display important metrics with icons and loading states. Located in the Dashboard tab.

### Data Tables
Responsive tables with custom rendering functions, hover effects, and empty state handling.

### Pagination
Smart pagination with previous/next controls and page indicators.

### Status Badges
Color-coded badges for model states:
- 🟢 **Producción** (Production)
- 🟡 **Staging** (Staging)
- 🔴 **Retirado** (Retired)
- 🔵 **En Entrenamiento** (Training)

## 🔧 API Service

The `APIService` class in `src/services/api.ts` provides methods for all microservice interactions:

```typescript
// Examples
apiService.getFeatures(limit, skip, tipo)
apiService.getModels(limit, skip, framework, estado)
apiService.getLogs(modeloId, page, limit)
apiService.runPrediction(request)
apiService.getFrameworkAnalytics()
apiService.getDriftAnalytics()
apiService.getTopModelsVolume()
```

## 🚢 Deployment

The project can be deployed to AWS Amplify or any Node.js hosting:

```bash
# Build the project
pnpm build

# Deploy the dist/ folder
```

## 📝 Environment Variables

Create a `.env.local` file for custom API endpoints:

```
VITE_API_MS1=http://localhost:8001
VITE_API_MS2=http://localhost:8002
VITE_API_MS3=http://localhost:8003
VITE_API_MS4=http://localhost:8004
VITE_API_MS5=http://localhost:8005
```

## 💻 Development

### Adding New Features

1. Create a new component in `src/components/`
2. Use the existing Card, DataTable, and Badge components
3. Call API methods from `apiService`
4. Add TypeScript types in `src/types/index.ts`

### Styling

All styling uses Tailwind CSS classes. Customize the color scheme in `tailwind.config.js`.

## 📄 License

This project is part of a cloud computing university course.

## 🙋 Support

For issues or questions, contact the development team or check the GitHub repository.
