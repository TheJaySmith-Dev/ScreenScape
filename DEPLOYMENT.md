# Deploying the Application

This document provides instructions on how to build and deploy the application for production.

## Prerequisites

- Node.js (v16 or later)
- npm (v8 or later)

## Installation

1.  Clone the repository.
2.  Install the dependencies:
    ```bash
    npm install
    ```

## Building for Production

To build the application for production, run the following command:

```bash
npm run build
```

This will create a `dist` directory in the root of the project. This directory contains the optimized and minified files for production.

## Deployment

To deploy the application, you need to serve the contents of the `dist` directory with a static file server. You can use any static file server you prefer, such as `serve`, `http-server`, or a cloud-based service like Vercel, Netlify, or AWS S3.

### Example with `serve`

1.  Install `serve`:
    ```bash
    npm install -g serve
    ```
2.  Serve the `dist` directory:
    ```bash
    serve -s dist
    ```

The application will be available at `http://localhost:3000` (or the next available port).

## Previewing the Production Build

Vite provides a command to preview the production build locally. This is useful for checking if the build was successful before deploying it.

To preview the production build, run the following command:

```bash
npm run preview
```

This will start a local server and serve the `dist` directory. The application will be available at `http://localhost:4173`.
