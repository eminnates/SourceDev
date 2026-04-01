# How Operating Systems Manage Processes: Dispatching & Scheduling

## What Is a Process?

A process is a program in execution. Unlike a static binary file on disk,
a process has:

- **PID** – unique process ID
- **Program counter** – next instruction to execute
- **Stack** – local variables, function call frames
- **Heap** – dynamically allocated memory
- **File descriptors** – open files, sockets
- **Process Control Block (PCB)** – the kernel's struct that tracks all of the above

---

## Process State Diagram

Every process moves through a finite set of states:

```
          fork()
            │
            ▼
        ┌────────┐
        │  NEW   │
        └────┬───┘
             │ admitted
             ▼
        ┌────────┐   scheduler dispatch   ┌─────────┐
        │ READY  │ ───────────────────────►│ RUNNING │
        │ queue  │ ◄───────────────────── │  (CPU)  │
        └────────┘    preempt / time-out  └────┬────┘
             ▲                                 │
             │         I/O or event wait       │
             │   ┌──────────────────────────── ┘
             │   ▼
        ┌────────────┐
        │  WAITING   │  (blocked on I/O, mutex, sleep…)
        └─────┬──────┘
              │ I/O complete / event fires
              └──────────────────► READY
                                        │
                                        │ exit()
                                        ▼
                                   ┌─────────┐
                                   │ ZOMBIE  │ ◄── parent hasn't called wait()
                                   └─────────┘
                                        │ wait()
                                        ▼
                                   ┌──────────┐
                                   │ TERMINATED│
                                   └──────────┘
```

---

## The Dispatcher

The **dispatcher** is the low-level kernel component that hands CPU control
to a process chosen by the scheduler. It does three things:

1. **Context switch** – saves CPU registers of current process into its PCB,
   loads registers of the next process from its PCB
2. **Mode switch** – transitions from kernel mode → user mode
3. **Jump** – sets the program counter to resume the new process

**Dispatch latency** = time to stop one process and start another.
Minimising it is critical for interactive responsiveness.

---

## Scheduling Algorithms

### 1. First-Come, First-Served (FCFS)

Simple queue. No preemption. Long jobs block short ones ("convoy effect").

### 2. Shortest Job First (SJF)

Optimal average wait time — but requires knowing burst time in advance.
Starvation risk for long processes.

### 3. Round Robin (RR)

Each process gets a fixed **time quantum** (typically 10–100 ms).
After quantum expires → preempted → back of ready queue.

```
Time:  0    10   20   30   40
       [P1] [P2] [P3] [P1] [P2] ...   (quantum = 10ms)
```

Best for time-sharing systems (Linux desktop, web servers).

### 4. Multilevel Feedback Queue (MLFQ)

The algorithm used by most real OSes (Linux CFS, Windows, macOS).

- Multiple queues with different priorities
- New processes start at highest priority
- If a process uses its full quantum → demoted one level
- I/O-bound processes (use little CPU) stay at high priority

```
Priority 0 (highest): ──[P_interactive]──
Priority 1:           ──[P_mixed]──
Priority 2 (lowest):  ──[P_batch]──[P_batch]──
```

### 5. Completely Fair Scheduler (CFS) — Linux

Instead of fixed quanta, CFS tracks **vruntime** (virtual runtime) per process.
The process with the lowest vruntime always runs next.
Stored in a red-black tree for O(log n) scheduling.

---

## Context Switch Deep Dive

```
User process A running
        │
   timer interrupt (or syscall)
        │
        ▼
  kernel saves A's registers → PCB_A
  kernel runs scheduler → picks B
  kernel loads B's registers ← PCB_B
        │
        ▼
User process B running
```

Cost: ~1–10 µs. Includes:

- Register save/restore
- TLB flush (on architectures without ASID tagging)
- Cache warming for new process

---

## Fork & Exec

```c
pid_t pid = fork();   // duplicates the process
if (pid == 0) {
    execve("/bin/ls", args, env);  // replaces memory image
} else {
    wait(NULL);  // parent waits for child
}
```

- `fork()` → copy-on-write clone of parent
- `exec()` → loads new binary, replaces address space
- Together they implement "create a new program"

---

## Inter-Process Communication (IPC)

| Method | Speed | Use case |
|--------|-------|----------|
| Pipe | Fast | Parent ↔ child |
| Named pipe (FIFO) | Fast | Unrelated processes |
| Message queue | Medium | Decoupled producers/consumers |
| Shared memory | Fastest | High-throughput data sharing |
| Socket | Slow (flexible) | Network or local cross-machine |
| Signal | Instant (limited) | Notifications (SIGKILL, SIGTERM) |

---

## Key Metrics

| Metric | Definition |
|--------|-----------|
| **CPU utilization** | % of time CPU is busy (target: 40–90%) |
| **Throughput** | processes completed per second |
| **Turnaround time** | finish time − arrival time |
| **Waiting time** | time spent in ready queue |
| **Response time** | time from request to first response |

---

## Summary

```
Program on disk
      │  fork/exec
      ▼
  Process (PCB created)
      │
      ▼
  Ready Queue  ◄──── preemption
      │  dispatcher
      ▼
  CPU execution
      │
   ┌──┴──┐
   │     │
  I/O  exit()
   │
  Wait → Ready → CPU …
```

The OS constantly cycles processes through this loop, creating the illusion
that hundreds of programs run simultaneously on just a few CPU cores.

---

## Threads vs Processes

A **thread** is a lightweight unit of execution within a process. All threads
in a process share the same heap and file descriptors, but each has its own
stack and registers.

```
Process
├── PCB (PID, file descriptors, heap, code segment)
├── Thread 1 → stack, registers, program counter
├── Thread 2 → stack, registers, program counter
└── Thread 3 → stack, registers, program counter
```

| | Process | Thread |
|--|---------|--------|
| Memory | Separate address space | Shared address space |
| Creation cost | High (fork + copy-on-write) | Low |
| Communication | IPC required | Direct memory access |
| Crash isolation | Strong | Weak (one thread crash = all crash) |
| Switching cost | High (TLB flush) | Low |

### User-space vs Kernel-space Threads

- **1:1 model** (Linux `pthreads`, Windows threads) — each user thread maps to one kernel thread. True parallelism on multicore, but creation is expensive.
- **M:N model** (Go goroutines, Erlang processes) — M user threads multiplexed over N kernel threads. Cheap creation, scheduler lives in userspace.
- **Green threads** — entirely in userspace, no kernel involvement. Can't utilise multiple cores natively.

---

## CPU Privilege Levels (Rings)

Modern CPUs enforce hardware-level protection via privilege rings:

```
Ring 0 — Kernel mode
  ├── Direct hardware access
  ├── Can execute privileged instructions (HLT, IN, OUT)
  └── Manages memory mappings (page tables)

Ring 3 — User mode
  ├── No direct hardware access
  ├── Memory isolated from other processes
  └── Must use syscalls to request kernel services
```

A process crosses from Ring 3 → Ring 0 via a **system call** (syscall
instruction on x86-64). The CPU saves user state, switches stack to kernel
stack, and jumps to the kernel's syscall handler.

```
User process
    │  read(fd, buf, n)   ← syscall number in RAX
    ▼
  SYSCALL instruction
    │
    ▼
  Kernel syscall handler
    │  validate args, perform I/O
    ▼
  SYSRET instruction
    │
    ▼
User process resumes
```

---

## Virtual Memory & Paging

Each process believes it owns the entire address space. The kernel maintains
a **page table** that maps virtual addresses → physical addresses.

```
Virtual Address Space (per process)     Physical RAM
┌──────────────────┐
│   Stack (grows ↓)│ VA: 0x7fff...  ──► PA: 0x3a00...
├──────────────────┤
│   (unused)       │
├──────────────────┤
│   Heap (grows ↑) │ VA: 0x5600...  ──► PA: 0x1200...
├──────────────────┤
│   BSS / Data     │ VA: 0x4040...  ──► PA: 0x8800...
├──────────────────┤
│   Code (.text)   │ VA: 0x4000...  ──► PA: 0x0200...
└──────────────────┘
```

Pages are typically **4 KB**. The CPU's Memory Management Unit (MMU) does
the translation on every memory access using the **TLB** (Translation
Lookaside Buffer) as a cache.

### Page Fault

If a process accesses a page not currently in RAM:

1. MMU raises a **page fault** exception
2. Kernel's page fault handler runs
3. Kernel loads the page from disk (swap) into RAM
4. Updates the page table
5. Resumes the process transparently

---

## Deadlock

A deadlock occurs when a set of processes are each waiting for a resource
held by another process in the set — forming a cycle with no exit.

```
Process A holds Lock 1, waiting for Lock 2
Process B holds Lock 2, waiting for Lock 1
        → neither can proceed
```

### Four Necessary Conditions (Coffman, 1971)

All four must hold simultaneously for deadlock to occur:

1. **Mutual exclusion** — resource can only be held by one process
2. **Hold and wait** — process holds a resource while waiting for another
3. **No preemption** — resources cannot be forcibly taken away
4. **Circular wait** — circular chain of processes each waiting on the next

### Prevention Strategies

| Strategy | How |
|----------|-----|
| Lock ordering | Always acquire locks in the same global order |
| Try-lock with timeout | If lock not acquired in N ms, release all and retry |
| Resource allocation graph | Detect cycles before granting |
| Banker's algorithm | Only grant if a safe state exists |

---

## Synchronisation Primitives

### Mutex (Mutual Exclusion Lock)

```c
pthread_mutex_lock(&m);
// critical section — only one thread at a time
pthread_mutex_unlock(&m);
```

Ownership-based: only the thread that locked can unlock.

### Semaphore

```c
sem_wait(&s);   // decrement; block if value == 0
// critical section
sem_post(&s);   // increment; wake one waiter
```

Not ownership-based. Used for signalling between threads (producer/consumer).

### Spinlock

```c
while (atomic_test_and_set(&lock));  // busy-wait
// critical section
atomic_clear(&lock);
```

Burns CPU cycles instead of sleeping. Only useful when the critical section
is very short and you're on a multicore system (sleeping would cost more than
spinning).

### Condition Variable

```c
pthread_mutex_lock(&m);
while (!condition_met)
    pthread_cond_wait(&cond, &m);   // atomically releases lock + sleeps
// proceed
pthread_mutex_unlock(&m);
```

Used to block a thread until some predicate becomes true.

---

## Multicore Scheduling (SMP)

On a machine with N cores, the kernel maintains N run queues (one per core)
plus a global load balancer.

```
Core 0 run queue: [P1] [P4] [P7]
Core 1 run queue: [P2] [P5]
Core 2 run queue: [P3] [P6] [P8] [P9]
                              ↑
                    load balancer migrates P9 → Core 1
```

### CPU Affinity

A process can be pinned to specific cores to avoid cache thrashing:

```bash
taskset -c 0,1 ./my_program   # run only on cores 0 and 1
```

### NUMA (Non-Uniform Memory Access)

On large servers, CPUs are grouped into **nodes**. Accessing RAM local to
your node is fast; accessing remote node RAM is 2–4× slower.

```
Node 0              Node 1
┌──────────┐        ┌──────────┐
│ Core 0–7 │◄──QPI──►│ Core 8–15│
│ RAM 0    │        │ RAM 1    │
└──────────┘        └──────────┘
```

Linux's NUMA-aware allocator tries to allocate memory on the same node as
the running process.

---

## Real-Time Scheduling

Standard schedulers optimise for throughput and fairness. Real-time systems
need **guaranteed** response within a deadline.

### SCHED_FIFO & SCHED_RR (POSIX)

- `SCHED_FIFO` — highest priority RT process runs until it blocks or yields. No time quantum.
- `SCHED_RR` — same but with a time quantum. Round-robins among equal-priority RT tasks.
- RT tasks always preempt any `SCHED_OTHER` (normal) task.

### Rate Monotonic Scheduling (RMS)

Static priority assignment: shorter period → higher priority. Provably
optimal for fixed-priority preemptive scheduling.

```
Task A: period 20ms, execution 3ms  → priority 1 (highest)
Task B: period 50ms, execution 10ms → priority 2
Task C: period 100ms, execution 20ms→ priority 3
```

CPU utilisation bound for schedulability: U ≤ n(2^(1/n) − 1) → ~69% for large n.

---

## Process Creation Internals (Linux)

```
clone() syscall
    │
    ▼
copy_process()
    ├── dup_task_struct()    → allocate new PCB + kernel stack
    ├── copy_mm()            → clone or share address space
    ├── copy_files()         → clone or share file descriptor table
    ├── copy_signal()        → clone signal handlers
    └── sched_fork()         → initialise scheduler fields, vruntime = parent's
    │
    ▼
wake_up_new_task()           → insert into run queue
```

`fork()` is just `clone()` with flags for a full copy.
`pthread_create()` is `clone()` with flags for shared memory + stack.

---

## Putting It All Together

```
Hardware timer fires every 1ms (HZ=1000)
        │
        ▼
  IRQ handler → scheduler_tick()
        │
        ├── update vruntime of current task
        ├── check if a higher-priority task is now runnable
        │       └── if yes → set TIF_NEED_RESCHED flag
        │
        ▼
  Return from interrupt
        │
        ├── TIF_NEED_RESCHED set?
        │       └── yes → call schedule()
        │
        ▼
  schedule()
        ├── pick_next_task()  → walk red-black tree, pick lowest vruntime
        ├── context_switch()  → save/restore registers, switch page tables
        └── return to user mode in new process
```

This entire pipeline — from hardware interrupt to a new process running —
takes roughly **3–10 µs** on a modern Linux kernel.
