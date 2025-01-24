# LibreChat Project Structure

## Overview
LibreChat is a chat application that provides a flexible and extensible platform for various AI model integrations. The project follows a client-server architecture with React frontend and Node.js backend.

## Project Structure

### Frontend (`/client`)
The frontend is built with React and organized into several key components:

#### Core Components

##### Chat Components
- **Chat/**: Main chat interface components
  - `ChatView.tsx`: Main chat view container managing messages and UI state
  - `ChatForm.tsx`: Chat input form with file upload and message submission
  - `Messages/`: Message rendering and handling
    - `MessagesView.tsx`: Renders the message thread
    - `MessageContent.tsx`: Individual message content renderer
    - `Content/`: Message content parsing and display components
  - `Input/`: Chat input components
    - `TextareaHeader.tsx`: Header component for the chat input
    - `AudioRecorder.tsx`: Voice input functionality
    - `StreamAudio.tsx`: Audio streaming component
    - `Files/`: File handling components for chat
  - `Menus/`: Chat-related menus and dropdowns
    - `EndpointsMenu.tsx`: AI model endpoint selection
    - `ModelSpecsMenu.tsx`: Model specifications and settings
    - `PresetsMenu.tsx`: Preset prompts and configurations

##### Navigation & Layout
- **Nav/**: Navigation components
  - `Nav.tsx`: Main navigation component
  - `MobileNav.tsx`: Responsive mobile navigation
- **SidePanel/**: Side panel UI components for additional features
- **Presentation.tsx**: Main layout wrapper with drag-and-drop support

##### Feature Components
- **Auth/**: Authentication components and user management
- **Endpoints/**: AI model endpoint configurations
  - `EndpointSettings.tsx`: Endpoint configuration UI
  - `Settings/`: Individual endpoint settings components
- **Conversations/**: Conversation management
  - History tracking
  - Conversation metadata handling
- **Prompts/**: Prompt template system
  - Template management
  - Prompt customization
- **Tools/**: Utility tools and plugins interface
  - Plugin management
  - Tool integration components

##### UI Components
- **ui/**: Reusable UI components library
- **svg/**: SVG assets and icons
- **Artifacts/**: Asset management components
- **Audio/**: Audio processing components
- **Banners/**: Notification components
- **Bookmarks/**: Conversation saving functionality
- **Files/**: File handling components
- **Share/**: Sharing functionality

### Backend (`/api`)

#### Core Services (`/app`)

##### Client Implementations
- **clients/**: AI model client implementations
  - `OpenAIClient.js`: OpenAI API integration
  - `AnthropicClient.js`: Anthropic API integration
  - `PluginsClient.js`: Plugin system implementation
  - `ChatGPTClient.js`: ChatGPT-specific implementation
  - `GoogleClient.js`: Google AI integration
  - `BaseClient.js`: Base client class with common functionality

##### Tools and Plugins
- **tools/**: Tool implementations
  - `structured/`: Structured tool implementations
    - `DALLE3.js`: DALL-E 3 integration
    - `Wolfram.js`: Wolfram Alpha integration
    - `GoogleSearch.js`: Google Search API
    - `StableDiffusion.js`: Stable Diffusion integration
  - `dynamic/`: Dynamic tool loading system
  - `.well-known/`: Plugin manifests and configurations

##### Prompt Management
- **prompts/**: Prompt handling and formatting
  - `formatMessages.js`: Message formatting utilities
  - `summaryPrompts.js`: Conversation summarization
  - `titlePrompts.js`: Title generation
  - `instructions.js`: System instructions
  - `createVisionPrompt.js`: Vision model prompts

##### Agent System
- **agents/**: AI agent implementations
  - `CustomAgent/`: Custom agent implementation
  - `Functions/`: Function calling system
  - `initializeFunctionsAgent.js`: Agent initialization

#### Configuration
- **.env**: Environment configuration
  - API keys
  - Service endpoints
  - Feature flags
- **librechat.yaml**: Application configuration
  - Model settings
  - Plugin configurations
  - System defaults
- **docker-compose.yml**: Docker deployment configuration
  - Service definitions
  - Container configurations
  - Network settings

### Development Tools
- **e2e/**: End-to-end testing suite
- **utils/**: Utility functions
  - Token handling
  - File processing
  - Error handling
- **packages/**: Shared packages
- **.husky/**: Git hooks
- **.vscode/**: Editor configuration
- **config/**: Application configuration

### Documentation and Setup
- **README.md**: Project documentation
- **LICENSE**: MIT License
- **charts/**: Kubernetes Helm charts
- **Dockerfile**: Container build configuration

## Key Features
- Multiple AI model support (OpenAI, Anthropic, Google, etc.)
- Real-time chat interface with streaming responses
- Plugin system for extensibility
- File sharing and processing
- Voice input/output
- Conversation management
- Mobile-responsive design
- Authentication system
- Configuration management
- Tool integration (DALL-E, Stable Diffusion, Google Search, etc.)

## Development
The project uses modern development tools and practices:
- TypeScript for type safety
- React for UI components
- Node.js for backend services
- ESLint for code quality
- Prettier for code formatting
- Docker for containerization
- GitHub Actions for CI/CD
- Jest for testing
- Langchain for AI chain management 