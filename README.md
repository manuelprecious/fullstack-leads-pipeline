## **The Data Flow Lifecycle**

The pipeline operates on a decoupled data loop where configuration files manage environment mapping, while the code references them dynamically.

```plaintext
[ Local Host Environment ]
   └── .env file (Secrets: DB_PASSWORD, etc.)
        │
        ▼ (Injected at runtime)
[ Docker Compose Stack ] ───► Passes DB vars to Backend Container
                                 │
                                 ▼ (Injected via Vite Build)
                             Passes VITE_API_BASE_URL to Frontend Container
```

### **1\. The Configuration Interdependency**

* **Root `.env` Control:** When you execute `docker compose up`, Docker Compose reads your local, untracked `.env` file and binds the structural variables (`DB_USER`, `DB_PASSWORD`, `DB_PORT`) to the global container environment space.  
* **The Network Gateway Bridge:** The backend Node container reads these injected variables out of the process environment layer to initialize its `pg` connection pool. Because the database service name is defined as `db` in the compose file, the backend targets `DB_HOST=db`—allowing Docker's internal DNS to route traffic securely without exposing the database port to the host machine.  
* **Frontend Compilation:** The frontend container reads `VITE_API_BASE_URL` during compilation. This tells the client browser application exactly where to route async data form payloads.

## **Operating Guide: How to Initialize and Use the Pipeline**

### **Component Setup Matrix**

To spin up or maintain this stack without breaking environmental boundaries, map your workflow to the following files in the repository:

* **`/backend/src/server.js`:** The core routing listener. It exposes the POST endpoint `/api/leads` for processing raw records, the GET endpoint `/api/leads` for populating log history tables, and the `/health` diagnostic check.  
* **`/frontend/src/App.jsx`:** The active dashboard UI state engine. It features an automated 5-second polling system that runs asynchronously in the browser background, requesting fresh transactional records from the API gateway without interrupting user input.

### **Step-by-Step Execution Sequence**

#### **1\. Blueprint Configuration Setup**

Before spinning up the containers, instantiate your local configurations using the tracked template blueprints:

```bash
# Initialize root deployment attributes
cp .env.example .env

# Initialize client environment targets
cp frontend/.env.example frontend/.env
```

*Open your newly created root `.env` file and fill in your desired database credentials (e.g., `DB_PASSWORD`).*

#### **2\. Network Compilation & Ingestion Testing**

Compile the isolated container layers and launch the network stack in detached mode:

```bash
docker compose up --build -d
```

Once the containers register as operational, open `http://localhost` in your browser to access the dashboard:

1. **Interactive Simulation:** Use the data intake form widget to construct a custom test lead (e.g., inputting a unique sequence number, campaign source, and an ML conversion score).  
2. **Dynamic Ingestion:** Click "Ingest Payload". The React state machine ships a structural JSON payload to the Express container, which validates the fields and streams the record into PostgreSQL.  
3. **State Updates:** The real-time polling table will capture the new row and render it instantly in the visual grid list, cleanly applying dynamic color badges based on the conversion probability score.

## **Git Maintenance Protocol**

* **Protecting Secrets:** Because `.env` is declared inside your `.gitignore` and `.dockerignore`, you can run updates on the codebase safely.  
* **Safe Merging:** Push feature code updates to `origin feature/database-infrastructure` and use the GitHub web interface to open a Pull Request. Merging visually on the website guarantees your local database parameters, container layers, and system logs remain untouched on your virtual machine.
```