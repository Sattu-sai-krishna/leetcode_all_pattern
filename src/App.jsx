import { useState, useEffect, useRef } from "react";

const T = {
  bg: "#06060f", panel: "#0c0c1a", card: "#111120", border: "#1a1a2e",
  accent: "#00ffcc", accent2: "#ff6b6b", accent3: "#ffd93d", accent4: "#6bcb77",
  purple: "#c77dff", blue: "#4cc9f0", orange: "#ff9f1c", pink: "#f72585",
  text: "#e8eaf6", muted: "#4a5568", dim: "#252540",
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ─── SHARED UI ────────────────────────────────────────────────────────
function Btn({ onClick, color = T.accent, disabled, children, sm, full }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: disabled ? T.dim : color + "18", border: `1.5px solid ${disabled ? T.border : color}`,
      borderRadius: 8, padding: sm ? "5px 12px" : "8px 20px", color: disabled ? T.muted : color,
      fontWeight: 700, fontSize: sm ? 11 : 13, cursor: disabled ? "not-allowed" : "pointer",
      fontFamily: "monospace", letterSpacing: .5, width: full ? "100%" : undefined,
      transition: "all .2s",
    }}>{children}</button>
  );
}

function Badge({ color, children }) {
  return <span style={{ background: color + "22", border: `1px solid ${color}`, color, borderRadius: 6, padding: "2px 8px", fontSize: 10, fontFamily: "monospace", fontWeight: 700 }}>{children}</span>;
}

function CodePanel({ code, highlight = -1 }) {
  const lines = code.trim().split("\n");
  return (
    <div style={{ background: "#03030c", borderRadius: 10, padding: "10px 12px", fontFamily: "monospace", fontSize: 11.5, lineHeight: 1.85, border: `1px solid ${T.border}`, overflowX: "auto", flex: 1 }}>
      {lines.map((ln, i) => (
        <div key={i} style={{
          display: "flex", gap: 10,
          background: highlight === i ? "#00ffcc0e" : "transparent",
          borderLeft: `3px solid ${highlight === i ? T.accent : "transparent"}`,
          paddingLeft: 5, borderRadius: 3, transition: "all .25s",
        }}>
          <span style={{ color: T.dim, minWidth: 16, textAlign: "right", userSelect: "none", fontSize: 10 }}>{i + 1}</span>
          <span style={{ color: highlight === i ? T.accent : "#7986cb", whiteSpace: "pre" }}>{ln}</span>
        </div>
      ))}
    </div>
  );
}

function Log({ entries, color = T.accent }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [entries]);
  return (
    <div ref={ref} style={{ background: "#03030c", border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 12px", minHeight: 80, maxHeight: 130, overflowY: "auto", fontFamily: "monospace", fontSize: 11 }}>
      {entries.length === 0
        ? <div style={{ color: T.muted }}>▸ Press Run to start step-by-step animation...</div>
        : entries.map((e, i) => (
          <div key={i} style={{ color: i === entries.length - 1 ? color : T.muted, padding: "1px 0", transition: "color .2s" }}>
            {e}
          </div>
        ))}
    </div>
  );
}

function Section({ title, badge, badgeColor, children, flex }) {
  return (
    <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 14, padding: 16, display: flex ? "flex" : undefined, flexDirection: flex ? "column" : undefined }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontWeight: 800, fontSize: 13, color: T.text }}>{title}</span>
        {badge && <Badge color={badgeColor || T.accent}>{badge}</Badge>}
      </div>
      {children}
    </div>
  );
}

function Cell({ val, color, label, small, strikethrough, highlight, pulse }) {
  const c = color || T.border;
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        width: small ? 36 : 44, height: small ? 36 : 44,
        display: "flex", alignItems: "center", justifyContent: "center",
        border: `2px solid ${c}`, borderRadius: 8, background: c + "20",
        fontSize: small ? 12 : 15, fontWeight: 800, fontFamily: "monospace",
        color: c === T.border ? T.text : c,
        boxShadow: highlight ? `0 0 14px ${c}55` : pulse ? `0 0 0 3px ${c}33` : "none",
        transition: "all .3s",
        textDecoration: strikethrough ? "line-through" : "none",
        opacity: strikethrough ? 0.4 : 1,
        animation: pulse ? "pulseGlow 1s ease infinite" : "none",
      }}>{val}</div>
      {label !== undefined && <div style={{ fontSize: 9, color: T.muted, fontFamily: "monospace", marginTop: 2 }}>{label}</div>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// PATTERN 1 — SLIDING WINDOW
// ══════════════════════════════════════════════════════════════════════
function SlidingWindow() {
  const arr = [2, 1, 5, 1, 3, 2, 7, 4];
  const k = 3;
  const [winL, setWinL] = useState(-1);
  const [winR, setWinR] = useState(-1);
  const [maxWin, setMaxWin] = useState([]);
  const [curSum, setCurSum] = useState(null);
  const [maxSum, setMaxSum] = useState(null);
  const [log, setLog] = useState([]);
  const [running, setRunning] = useState(false);
  const [codeLine, setCodeLine] = useState(-1);
  const addLog = m => setLog(p => [...p, m]);

  const run = async () => {
    setRunning(true); setLog([]); setWinL(-1); setWinR(-1); setMaxWin([]); setCurSum(null); setMaxSum(null);
    addLog(`Find max sum subarray of size k=${k}`);
    let windowSum = arr.slice(0, k).reduce((a, b) => a + b, 0);
    setWinL(0); setWinR(k - 1); setCurSum(windowSum); setMaxSum(windowSum); setMaxWin([0, k - 1]);
    setCodeLine(1); addLog(`Initial window [0..${k-1}] sum = ${windowSum}`);
    await sleep(900);
    for (let i = k; i < arr.length; i++) {
      windowSum += arr[i] - arr[i - k];
      setWinL(i - k + 1); setWinR(i); setCurSum(windowSum);
      setCodeLine(4); addLog(`Slide: +arr[${i}]=${arr[i]}, -arr[${i-k}]=${arr[i-k]} → sum=${windowSum}`);
      await sleep(850);
      if (windowSum > maxSum) {
        setMaxSum(windowSum); setMaxWin([i - k + 1, i]);
        setCodeLine(5); addLog(`  New max! ${windowSum} at [${i-k+1}..${i}] ✅`);
        await sleep(500);
      }
    }
    addLog(`Max sum = ${maxSum}, window = [${maxWin}] 🎯`);
    setCodeLine(-1); setRunning(false);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Section title="Visualization" badge={`k = ${k}`} badgeColor={T.accent}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontFamily: "monospace", color: T.muted, marginBottom: 6 }}>Array: Find max sum subarray of size {k}</div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {arr.map((v, i) => {
                const inWin = winL >= 0 && i >= winL && i <= winR;
                const inMax = maxWin.length === 2 && i >= maxWin[0] && i <= maxWin[1];
                const c = inWin ? T.accent : inMax && winL === -1 ? T.accent4 : T.border;
                return (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div style={{
                      width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center",
                      border: `2px solid ${c}`, borderRadius: 8, background: c + "22",
                      fontSize: 16, fontWeight: 800, fontFamily: "monospace", color: inWin ? c : T.text,
                      boxShadow: inWin ? `0 0 12px ${c}55` : "none",
                      transition: "all .3s",
                    }}>{v}</div>
                    <div style={{ fontSize: 9, color: T.muted, fontFamily: "monospace", marginTop: 2 }}>[{i}]</div>
                  </div>
                );
              })}
            </div>
            {/* Window indicator */}
            {winL >= 0 && (
              <div style={{ marginTop: 8, display: "flex", gap: 16, fontFamily: "monospace", fontSize: 11 }}>
                <span style={{ color: T.accent }}>Window [{winL}..{winR}] = {curSum}</span>
                {maxSum !== null && <span style={{ color: T.accent4 }}>Max = {maxSum}</span>}
              </div>
            )}
          </div>
          <Btn onClick={run} disabled={running} color={T.accent} full>▶ Animate</Btn>
        </Section>
        <Log entries={log} color={T.accent} />
        <Section title="Identify This Pattern" badgeColor={T.accent3} badge="Triggers">
          {["Subarray / substring of size k", "Longest/shortest with condition", "\"contiguous\" keyword in problem", "Max/Min sum of window"].map(t => (
            <div key={t} style={{ fontSize: 11, color: T.muted, fontFamily: "monospace", padding: "2px 0" }}>▸ {t}</div>
          ))}
        </Section>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Section title="Python Code" flex>
          <CodePanel highlight={codeLine} code={`def max_sum_subarray(arr, k):
    window_sum = sum(arr[:k])   # first window
    max_sum = window_sum

    for i in range(k, len(arr)):
        window_sum += arr[i] - arr[i - k]  # slide!
        max_sum = max(max_sum, window_sum)

    return max_sum

# Pattern template (variable window):
def longest_subarray_with_k_ones(arr, k):
    left = 0; zeros = 0; result = 0
    for right in range(len(arr)):
        if arr[right] == 0: zeros += 1
        while zeros > k:         # shrink window
            if arr[left] == 0: zeros -= 1
            left += 1
        result = max(result, right - left + 1)
    return result`} />
        </Section>
        <Section title="Complexity" badge="Big O">
          <div style={{ fontFamily: "monospace", fontSize: 11 }}>
            {[["Time", "O(n)", T.accent4], ["Space", "O(1)", T.accent], ["Brute Force", "O(n·k) → O(n)", T.accent3]].map(([a, b, c]) => (
              <div key={a} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: `1px solid ${T.border}` }}>
                <span style={{ color: T.muted }}>{a}</span><Badge color={c}>{b}</Badge>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// PATTERN 2 — TWO POINTERS
// ══════════════════════════════════════════════════════════════════════
function TwoPointers() {
  const arr = [-3, -1, 1, 2, 4, 6, 8, 11];
  const target = 9;
  const [left, setLeft] = useState(-1);
  const [right, setRight] = useState(-1);
  const [found, setFound] = useState([]);
  const [log, setLog] = useState([]);
  const [running, setRunning] = useState(false);
  const [codeLine, setCodeLine] = useState(-1);
  const addLog = m => setLog(p => [...p, m]);

  const run = async () => {
    setRunning(true); setLog([]); setLeft(-1); setRight(-1); setFound([]);
    addLog(`Two Sum in sorted array. Target = ${target}`);
    let l = 0, r = arr.length - 1;
    setLeft(l); setRight(r); setCodeLine(1);
    await sleep(600);
    while (l < r) {
      const sum = arr[l] + arr[r];
      setLeft(l); setRight(r);
      addLog(`arr[${l}]=${arr[l]} + arr[${r}]=${arr[r]} = ${sum} ${sum === target ? "= " + target + " ✅ FOUND!" : sum < target ? "< " + target + " → move left right" : "> " + target + " → move right left"}`);
      setCodeLine(sum === target ? 4 : sum < target ? 5 : 6);
      await sleep(850);
      if (sum === target) { setFound([l, r]); addLog(`Pair found: (${arr[l]}, ${arr[r]}) 🎯`); break; }
      else if (sum < target) l++;
      else r--;
    }
    setCodeLine(-1); setRunning(false);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Section title="Two Sum in Sorted Array" badge={`Target = ${target}`} badgeColor={T.blue}>
          <div style={{ fontSize: 10, fontFamily: "monospace", color: T.muted, marginBottom: 8 }}>Sorted array — use left & right pointers</div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
            {arr.map((v, i) => {
              const isL = left === i, isR = right === i;
              const isFound = found.includes(i);
              const c = isFound ? T.accent4 : isL ? T.blue : isR ? T.accent2 : T.border;
              return (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 8, fontFamily: "monospace", color: isL ? T.blue : isR ? T.accent2 : "transparent", marginBottom: 2, fontWeight: 700 }}>
                    {isL ? "L" : isR ? "R" : "·"}
                  </div>
                  <div style={{
                    width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center",
                    border: `2px solid ${c}`, borderRadius: 8, background: c + "22",
                    fontSize: 14, fontWeight: 800, fontFamily: "monospace", color: c === T.border ? T.text : c,
                    boxShadow: (isL || isR || isFound) ? `0 0 12px ${c}55` : "none", transition: "all .3s",
                  }}>{v}</div>
                  <div style={{ fontSize: 9, color: T.muted, fontFamily: "monospace", marginTop: 2 }}>[{i}]</div>
                </div>
              );
            })}
          </div>
          <Btn onClick={run} disabled={running} color={T.blue} full>▶ Animate</Btn>
        </Section>
        <Log entries={log} color={T.blue} />
        <Section title="Identify This Pattern" badgeColor={T.accent3} badge="Triggers">
          {["Sorted array + pair/triplet problem", "\"Two Sum\", \"Three Sum\"", "Palindrome check", "Removing duplicates in-place", "Container with most water"].map(t => (
            <div key={t} style={{ fontSize: 11, color: T.muted, fontFamily: "monospace", padding: "2px 0" }}>▸ {t}</div>
          ))}
        </Section>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Section title="Python Code" flex>
          <CodePanel highlight={codeLine} code={`def two_sum_sorted(arr, target):
    left, right = 0, len(arr) - 1

    while left < right:
        current_sum = arr[left] + arr[right]
        if current_sum == target:
            return [left, right]   # FOUND!
        elif current_sum < target:
            left += 1     # need bigger sum
        else:
            right -= 1    # need smaller sum

    return []  # no pair found

# Three Sum (similar idea):
def three_sum(arr):
    arr.sort(); result = []
    for i in range(len(arr) - 2):
        l, r = i + 1, len(arr) - 1
        while l < r:
            s = arr[i] + arr[l] + arr[r]
            if s == 0: result.append([arr[i],arr[l],arr[r]]); l+=1; r-=1
            elif s < 0: l += 1
            else: r -= 1
    return result`} />
        </Section>
        <Section title="Key Insight" badge="Why it works">
          {["Sorted array = predictable movement", "sum < target → left must increase", "sum > target → right must decrease", "Eliminates O(n²) brute force → O(n)", "Works in-place, O(1) space"].map(t => (
            <div key={t} style={{ fontSize: 11, color: T.muted, fontFamily: "monospace", padding: "2px 0" }}>▸ {t}</div>
          ))}
        </Section>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// PATTERN 3 — FAST & SLOW POINTERS
// ══════════════════════════════════════════════════════════════════════
function FastSlow() {
  const nodes = [1, 2, 3, 4, 5, 6, 3]; // 6→3 creates cycle
  const [slow, setSlow] = useState(-1);
  const [fast, setFast] = useState(-1);
  const [log, setLog] = useState([]);
  const [running, setRunning] = useState(false);
  const [met, setMet] = useState(false);
  const [codeLine, setCodeLine] = useState(-1);
  const addLog = m => setLog(p => [...p, m]);

  const run = async () => {
    setRunning(true); setLog([]); setSlow(-1); setFast(-1); setMet(false);
    addLog("Floyd's Cycle Detection: slow moves 1 step, fast moves 2 steps");
    // Simulate: cycle at index 2 (value 3)
    const nextMap = [1, 2, 3, 4, 5, 2]; // index 5→2 creates cycle
    let s = 0, f = 0;
    setSlow(s); setFast(f); setCodeLine(1);
    await sleep(700);
    for (let step = 0; step < 12; step++) {
      s = nextMap[s]; f = nextMap[nextMap[f]];
      setSlow(s); setFast(f); setCodeLine(3);
      addLog(`Step ${step+1}: slow→[${s}]=${nodes[s]}, fast→[${f}]=${nodes[f]}`);
      await sleep(800);
      if (s === f) {
        setMet(true); setCodeLine(4);
        addLog(`✅ CYCLE DETECTED! Both at index [${s}] — cycle exists!`);
        break;
      }
    }
    setCodeLine(-1); setRunning(false);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Section title="Cycle Detection (Floyd's Algorithm)" badge="Linked List" badgeColor={T.purple}>
          <div style={{ fontSize: 10, fontFamily: "monospace", color: T.muted, marginBottom: 8 }}>
            Linked list with a cycle (node 6 points back to node 3)
          </div>
          {/* Linked list visual */}
          <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto", marginBottom: 8 }}>
            {[1,2,3,4,5,6].map((v, i) => {
              const isSlow = slow === i, isFast = fast === i, isBoth = isSlow && isFast;
              const c = isBoth ? T.accent3 : isSlow ? T.purple : isFast ? T.accent2 : T.border;
              return (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ fontSize: 9, fontFamily: "monospace", marginBottom: 2, height: 14, display:"flex", gap:3 }}>
                    {isSlow && <span style={{ color: T.purple }}>S</span>}
                    {isFast && <span style={{ color: T.accent2 }}>F</span>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{
                      width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center",
                      border: `2px solid ${c}`, borderRadius: 8, background: c + "22",
                      fontSize: 14, fontWeight: 800, fontFamily: "monospace", color: c === T.border ? T.text : c,
                      boxShadow: (isSlow || isFast) ? `0 0 12px ${c}55` : "none", transition: "all .3s",
                    }}>{v}</div>
                    {i < 5 && <div style={{ width: 10, height: 2, background: T.dim }} />}
                    {i === 5 && <div style={{ fontSize: 10, color: T.accent2, margin: "0 4px", transform: "rotate(0deg)" }}>↙</div>}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 10, fontFamily: "monospace", color: T.accent2, marginBottom: 10 }}>
            ↩ Node 6 → points back to Node 3 (creates cycle)
          </div>
          {met && <div style={{ background: T.accent4 + "18", border: `1px solid ${T.accent4}`, borderRadius: 8, padding: "6px 12px", fontFamily: "monospace", fontSize: 12, color: T.accent4, marginBottom: 8 }}>🎯 Cycle Detected!</div>}
          <Btn onClick={run} disabled={running} color={T.purple} full>▶ Animate</Btn>
        </Section>
        <Log entries={log} color={T.purple} />
        <Section title="Identify This Pattern" badgeColor={T.accent3} badge="Triggers">
          {["Cycle in linked list / array", "Find middle of linked list", "Find cycle start", "Happy number problem", "Palindrome linked list"].map(t => (
            <div key={t} style={{ fontSize: 11, color: T.muted, fontFamily: "monospace", padding: "2px 0" }}>▸ {t}</div>
          ))}
        </Section>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Section title="Python Code" flex>
          <CodePanel highlight={codeLine} code={`def has_cycle(head):
    slow = fast = head

    while fast and fast.next:
        slow = slow.next           # 1 step
        fast = fast.next.next      # 2 steps
        if slow == fast:
            return True  # CYCLE!

    return False  # no cycle

# Find MIDDLE of linked list:
def find_middle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow  # slow = middle!

# Why it works:
# Fast laps slow inside the cycle.
# They MUST meet (like clock hands).`} />
        </Section>
        <Section title="Key Insight" badge="Why fast catches slow">
          {["Slow moves 1 node, Fast moves 2", "In a cycle, fast laps slow", "They always meet if cycle exists", "No cycle → fast reaches null", "No extra space needed — O(1)"].map(t => (
            <div key={t} style={{ fontSize: 11, color: T.muted, fontFamily: "monospace", padding: "2px 0" }}>▸ {t}</div>
          ))}
        </Section>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// PATTERN 4 — MERGE INTERVALS
// ══════════════════════════════════════════════════════════════════════
function MergeIntervals() {
  const original = [[1,4],[2,6],[8,10],[9,12],[15,18]];
  const [merged, setMerged] = useState([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [merging, setMerging] = useState([]);
  const [log, setLog] = useState([]);
  const [running, setRunning] = useState(false);
  const [codeLine, setCodeLine] = useState(-1);
  const addLog = m => setLog(p => [...p, m]);

  const toX = v => (v / 20) * 280;

  const run = async () => {
    setRunning(true); setLog([]); setMerged([]); setActiveIdx(-1); setMerging([]);
    addLog("Sort intervals by start time first");
    setCodeLine(1); await sleep(700);
    const result = [];
    for (let i = 0; i < original.length; i++) {
      setActiveIdx(i); setCodeLine(2);
      addLog(`Processing [${original[i]}]`);
      await sleep(700);
      if (result.length === 0 || result[result.length-1][1] < original[i][0]) {
        result.push([...original[i]]);
        addLog(`  No overlap → add [${original[i]}] as new interval`);
        setCodeLine(4); setMerged([...result]);
      } else {
        const prev = result[result.length-1];
        const newEnd = Math.max(prev[1], original[i][1]);
        setMerging([prev[0], newEnd]);
        addLog(`  OVERLAP! [${prev}] overlaps [${original[i]}] → merge to [${prev[0]}, ${newEnd}]`);
        setCodeLine(6);
        result[result.length-1][1] = newEnd;
        setMerged([...result]); setMerging([]);
        await sleep(400);
      }
      await sleep(700);
    }
    addLog(`Done! Merged: ${result.map(r => `[${r}]`).join(", ")} ✅`);
    setActiveIdx(-1); setCodeLine(-1); setRunning(false);
  };

  const colors = [T.blue, T.purple, T.accent2, T.accent3, T.orange];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Section title="Merge Overlapping Intervals" badge="Timeline" badgeColor={T.orange}>
          <div style={{ position: "relative", marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontFamily: "monospace", color: T.muted, marginBottom: 8 }}>Original intervals:</div>
            {/* Number line */}
            <div style={{ position: "relative", height: original.length * 32 + 10, marginBottom: 12 }}>
              {original.map(([s, e], i) => {
                const c = i === activeIdx ? colors[i % colors.length] : colors[i % colors.length] + "88";
                return (
                  <div key={i} style={{
                    position: "absolute", left: toX(s), width: toX(e - s),
                    top: i * 32, height: 22,
                    background: c + "33", border: `2px solid ${c}`,
                    borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontFamily: "monospace", color: c, fontWeight: 700,
                    transition: "all .3s", boxShadow: i === activeIdx ? `0 0 10px ${c}66` : "none",
                  }}>{s}–{e}</div>
                );
              })}
              {/* Axis */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: T.border }} />
              {[0,5,10,15,20].map(v => (
                <div key={v} style={{ position: "absolute", bottom: -14, left: toX(v), fontSize: 8, color: T.muted, fontFamily: "monospace", transform: "translateX(-50%)" }}>{v}</div>
              ))}
            </div>
            {/* Merged result */}
            {merged.length > 0 && (
              <div>
                <div style={{ fontSize: 10, fontFamily: "monospace", color: T.accent4, marginBottom: 6 }}>Merged result:</div>
                <div style={{ position: "relative", height: 30 }}>
                  {merged.map(([s, e], i) => (
                    <div key={i} style={{
                      position: "absolute", left: toX(s), width: Math.max(toX(e - s), 30),
                      top: 0, height: 22,
                      background: T.accent4 + "33", border: `2px solid ${T.accent4}`,
                      borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontFamily: "monospace", color: T.accent4, fontWeight: 700,
                      transition: "all .4s",
                    }}>{s}–{e}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Btn onClick={run} disabled={running} color={T.orange} full>▶ Animate</Btn>
        </Section>
        <Log entries={log} color={T.orange} />
        <Section title="Identify This Pattern" badgeColor={T.accent3} badge="Triggers">
          {["\"Merge overlapping intervals\"", "Meeting rooms / scheduling", "Insert interval into sorted list", "Find gaps between intervals", "Employee free time problem"].map(t => (
            <div key={t} style={{ fontSize: 11, color: T.muted, fontFamily: "monospace", padding: "2px 0" }}>▸ {t}</div>
          ))}
        </Section>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Section title="Python Code" flex>
          <CodePanel highlight={codeLine} code={`def merge_intervals(intervals):
    intervals.sort(key=lambda x: x[0])  # sort by start
    merged = []

    for interval in intervals:
        if not merged or merged[-1][1] < interval[0]:
            merged.append(interval)  # no overlap
        else:
            # OVERLAP: extend end
            merged[-1][1] = max(merged[-1][1], interval[1])

    return merged

# Overlap condition:
# A=[a,b], B=[c,d]
# Overlap if: c <= b  (B starts before A ends)

# Insert interval (sorted list):
def insert(intervals, new):
    result = []; i = 0
    while i < len(intervals) and intervals[i][1] < new[0]:
        result.append(intervals[i]); i += 1
    while i < len(intervals) and intervals[i][0] <= new[1]:
        new[0] = min(new[0], intervals[i][0])
        new[1] = max(new[1], intervals[i][1]); i += 1
    return result + [new] + intervals[i:]`} />
        </Section>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// PATTERN 5 — PREFIX SUM
// ══════════════════════════════════════════════════════════════════════
function PrefixSum() {
  const arr = [3, 1, 4, 2, 6, 5, 2];
  const [prefix, setPrefix] = useState([]);
  const [queryL, setQueryL] = useState("");
  const [queryR, setQueryR] = useState("");
  const [result, setResult] = useState(null);
  const [hlRange, setHlRange] = useState([]);
  const [log, setLog] = useState([]);
  const [running, setRunning] = useState(false);
  const [codeLine, setCodeLine] = useState(-1);
  const [buildDone, setBuildDone] = useState(false);
  const addLog = m => setLog(p => [...p, m]);

  const buildPrefix = async () => {
    setRunning(true); setLog([]); setPrefix([]); setBuildDone(false);
    addLog("Building prefix sum array...");
    const p = [0];
    setPrefix([...p]); setCodeLine(1);
    await sleep(500);
    for (let i = 0; i < arr.length; i++) {
      p.push(p[p.length - 1] + arr[i]);
      setPrefix([...p]); setCodeLine(2);
      addLog(`prefix[${i+1}] = prefix[${i}] + arr[${i}] = ${p[i]} + ${arr[i]} = ${p[i+1]}`);
      await sleep(500);
    }
    addLog(`Prefix array built! Now any range sum = O(1) ✅`);
    setBuildDone(true); setCodeLine(-1); setRunning(false);
  };

  const query = async () => {
    const l = parseInt(queryL), r = parseInt(queryR);
    if (isNaN(l) || isNaN(r) || prefix.length === 0) return;
    setRunning(true); setHlRange([l, r]); setResult(null);
    addLog(`Range sum query: arr[${l}..${r}]`);
    setCodeLine(5); await sleep(700);
    const res = prefix[r + 1] - prefix[l];
    addLog(`prefix[${r+1}] - prefix[${l}] = ${prefix[r+1]} - ${prefix[l]} = ${res}`);
    setResult(res); setCodeLine(6); await sleep(500);
    addLog(`Sum of arr[${l}..${r}] = ${res} ✅`);
    setCodeLine(-1); setRunning(false);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Section title="Prefix Sum Array" badge="O(1) range queries" badgeColor={T.accent4}>
          <div style={{ fontSize: 10, fontFamily: "monospace", color: T.muted, marginBottom: 6 }}>Original array:</div>
          <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
            {arr.map((v, i) => {
              const inRange = hlRange.length === 2 && i >= hlRange[0] && i <= hlRange[1];
              return (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{
                    width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
                    border: `2px solid ${inRange ? T.accent4 : T.border}`, borderRadius: 8, background: inRange ? T.accent4 + "22" : T.card,
                    fontSize: 15, fontWeight: 800, fontFamily: "monospace", color: inRange ? T.accent4 : T.text,
                    transition: "all .3s",
                  }}>{v}</div>
                  <div style={{ fontSize: 9, color: T.muted, fontFamily: "monospace", marginTop: 2 }}>[{i}]</div>
                </div>
              );
            })}
          </div>
          {prefix.length > 0 && (
            <>
              <div style={{ fontSize: 10, fontFamily: "monospace", color: T.accent, marginBottom: 6 }}>Prefix array (size n+1):</div>
              <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
                {prefix.map((v, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div style={{
                      width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center",
                      border: `2px solid ${T.accent}`, borderRadius: 8, background: T.accent + "18",
                      fontSize: 13, fontWeight: 800, fontFamily: "monospace", color: T.accent,
                      animation: "popIn .3s ease",
                    }}>{v}</div>
                    <div style={{ fontSize: 9, color: T.muted, fontFamily: "monospace", marginTop: 2 }}>[{i}]</div>
                  </div>
                ))}
              </div>
            </>
          )}
          {buildDone && (
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input value={queryL} onChange={e => setQueryL(e.target.value)} placeholder="L (0-6)" style={{ flex: 1, background: "#03030c", border: `1.5px solid ${T.border}`, borderRadius: 8, padding: "7px 10px", color: T.text, fontFamily: "monospace", fontSize: 13 }} />
              <input value={queryR} onChange={e => setQueryR(e.target.value)} placeholder="R (0-6)" style={{ flex: 1, background: "#03030c", border: `1.5px solid ${T.border}`, borderRadius: 8, padding: "7px 10px", color: T.text, fontFamily: "monospace", fontSize: 13 }} />
              <Btn onClick={query} disabled={running} color={T.accent4} sm>Query</Btn>
            </div>
          )}
          {result !== null && <div style={{ fontFamily: "monospace", fontSize: 13, color: T.accent4, marginBottom: 8 }}>Range Sum = {result}</div>}
          <Btn onClick={buildPrefix} disabled={running} color={T.accent4} full>▶ Build Prefix Array</Btn>
        </Section>
        <Log entries={log} color={T.accent4} />
        <Section title="Identify This Pattern" badgeColor={T.accent3} badge="Triggers">
          {["Multiple range sum queries", "Subarray sum = k", "2D grid prefix sums", "Running total / cumulative", "\"sum between indices\""].map(t => (
            <div key={t} style={{ fontSize: 11, color: T.muted, fontFamily: "monospace", padding: "2px 0" }}>▸ {t}</div>
          ))}
        </Section>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Section title="Python Code" flex>
          <CodePanel highlight={codeLine} code={`def build_prefix(arr):
    prefix = [0] * (len(arr) + 1)
    for i in range(len(arr)):
        prefix[i+1] = prefix[i] + arr[i]
    return prefix

def range_sum(prefix, left, right):
    return prefix[right+1] - prefix[left]
    # O(1) per query after O(n) build!

# Subarray sum equals k:
def subarray_sum_k(arr, k):
    count = 0; prefix_sum = 0
    seen = {0: 1}    # prefix_sum: count
    for num in arr:
        prefix_sum += num
        # if (prefix_sum - k) seen before
        count += seen.get(prefix_sum - k, 0)
        seen[prefix_sum] = seen.get(prefix_sum,0)+1
    return count`} />
        </Section>
        <Section title="Why Prefix Sum?" badge="Key insight">
          {["Precompute cumulative sums once", "Any range sum = prefix[r+1] - prefix[l]", "Turns O(n) query → O(1)", "Trade space for time", "Works in 2D grids too (matrix)"].map(t => (
            <div key={t} style={{ fontSize: 11, color: T.muted, fontFamily: "monospace", padding: "2px 0" }}>▸ {t}</div>
          ))}
        </Section>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// PATTERN 6 — BINARY SEARCH VARIATIONS
// ══════════════════════════════════════════════════════════════════════
function BinarySearchVariants() {
  const rotated = [4, 5, 6, 7, 0, 1, 2];
  const [target, setTarget] = useState("0");
  const [lo, setLo] = useState(-1); const [hi, setHi] = useState(-1); const [mid, setMid] = useState(-1);
  const [found, setFound] = useState(-1); const [elim, setElim] = useState([]);
  const [log, setLog] = useState([]); const [running, setRunning] = useState(false); const [codeLine, setCodeLine] = useState(-1);
  const addLog = m => setLog(p => [...p, m]);

  const run = async () => {
    const t = parseInt(target); if (isNaN(t)) return;
    setRunning(true); setLog([]); setFound(-1); setElim([]);
    addLog(`Search for ${t} in rotated sorted array`);
    let l = 0, r = rotated.length - 1;
    setLo(l); setHi(r);
    while (l <= r) {
      const m = Math.floor((l + r) / 2);
      setMid(m); setCodeLine(2);
      addLog(`lo=${l} hi=${r} mid=${m} → arr[mid]=${rotated[m]}`);
      await sleep(850);
      if (rotated[m] === t) { setFound(m); addLog(`Found ${t} at [${m}] 🎯`); break; }
      if (rotated[l] <= rotated[m]) {
        setCodeLine(5); addLog(`Left half [${rotated[l]}..${rotated[m]}] is sorted`);
        if (rotated[l] <= t && t < rotated[m]) { r = m - 1; setElim(p => [...p, ...Array.from({length: rotated.length - m}, (_,i) => m+i)]); }
        else { l = m + 1; setElim(p => [...p, ...Array.from({length: m - l + 1}, (_,i) => l-1+i)]); }
      } else {
        setCodeLine(8); addLog(`Right half [${rotated[m]}..${rotated[r]}] is sorted`);
        if (rotated[m] < t && t <= rotated[r]) { l = m + 1; }
        else { r = m - 1; }
      }
      setLo(l); setHi(r); await sleep(600);
    }
    if (found === -1 && !rotated.includes(t)) addLog(`${t} not found ❌`);
    setMid(-1); setLo(-1); setHi(-1); setCodeLine(-1); setRunning(false);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Section title="Search in Rotated Sorted Array" badge="Modified Binary Search" badgeColor={T.accent2}>
          <div style={{ fontSize: 10, fontFamily: "monospace", color: T.muted, marginBottom: 8 }}>
            [4, 5, 6, 7, 0, 1, 2] — sorted then rotated at pivot
          </div>
          <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
            {rotated.map((v, i) => {
              const isL = lo === i, isR = hi === i, isMid = mid === i, isFound = found === i;
              const c = isFound ? T.accent4 : isMid ? T.accent3 : isL || isR ? T.accent2 : T.border;
              return (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 8, fontFamily: "monospace", color: isL ? T.accent2 : isR ? T.accent2 : isMid ? T.accent3 : "transparent", marginBottom: 2 }}>
                    {isL && isR ? "lo=hi" : isL ? "lo" : isR ? "hi" : isMid ? "mid" : "·"}
                  </div>
                  <div style={{
                    width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
                    border: `2px solid ${c}`, borderRadius: 8, background: c + "22",
                    fontSize: 15, fontWeight: 800, fontFamily: "monospace", color: c === T.border ? T.text : c,
                    transition: "all .3s", opacity: elim.includes(i) ? 0.3 : 1,
                  }}>{v}</div>
                  <div style={{ fontSize: 9, color: T.muted, fontFamily: "monospace", marginTop: 2 }}>[{i}]</div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input value={target} onChange={e => setTarget(e.target.value)} placeholder="Target" style={{ flex: 1, background: "#03030c", border: `1.5px solid ${T.border}`, borderRadius: 8, padding: "7px 10px", color: T.text, fontFamily: "monospace", fontSize: 13 }} />
            <Btn onClick={run} disabled={running} color={T.accent2} sm>▶ Search</Btn>
          </div>
          <div style={{ fontSize: 10, fontFamily: "monospace", color: T.muted }}>Try: 0, 6, 7, 3 (not found)</div>
        </Section>
        <Log entries={log} color={T.accent2} />
        <Section title="Identify This Pattern" badgeColor={T.accent3} badge="Triggers">
          {["Sorted + rotated array", "Find peak element", "Find first/last position", "Search in infinite array", "Bitonic array search"].map(t => (
            <div key={t} style={{ fontSize: 11, color: T.muted, fontFamily: "monospace", padding: "2px 0" }}>▸ {t}</div>
          ))}
        </Section>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Section title="Python Code" flex>
          <CodePanel highlight={codeLine} code={`def search_rotated(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target: return mid

        # Left half is sorted
        if arr[lo] <= arr[mid]:
            if arr[lo] <= target < arr[mid]:
                hi = mid - 1   # target in left
            else:
                lo = mid + 1   # target in right
        else:
            # Right half is sorted
            if arr[mid] < target <= arr[hi]:
                lo = mid + 1   # target in right
            else:
                hi = mid - 1   # target in left
    return -1

# Find peak element:
def find_peak(arr):
    lo, hi = 0, len(arr) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if arr[mid] < arr[mid+1]: lo = mid + 1
        else: hi = mid
    return lo`} />
        </Section>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// PATTERN 7 — TOP K ELEMENTS (HEAP)
// ══════════════════════════════════════════════════════════════════════
function TopKElements() {
  const arr = [3, 1, 7, 2, 9, 4, 11, 6, 5];
  const K = 3;
  const [heap, setHeap] = useState([]);
  const [processing, setProcessing] = useState(-1);
  const [log, setLog] = useState([]);
  const [running, setRunning] = useState(false);
  const [codeLine, setCodeLine] = useState(-1);
  const [done, setDone] = useState(false);
  const addLog = m => setLog(p => [...p, m]);

  const run = async () => {
    setRunning(true); setLog([]); setHeap([]); setProcessing(-1); setDone(false);
    addLog(`Find top ${K} largest elements using a Min-Heap of size ${K}`);
    const h = [];
    for (let i = 0; i < arr.length; i++) {
      setProcessing(i); setCodeLine(2);
      addLog(`Processing ${arr[i]}`);
      await sleep(600);
      h.push(arr[i]); h.sort((a, b) => a - b);
      if (h.length > K) {
        const removed = h.shift();
        setHeap([...h]); setCodeLine(4);
        addLog(`  Heap full → remove min (${removed}), keep [${h.join(", ")}]`);
      } else {
        setHeap([...h]); setCodeLine(3);
        addLog(`  Added to heap: [${h.join(", ")}]`);
      }
      await sleep(600);
    }
    setDone(true); setProcessing(-1); setCodeLine(-1);
    addLog(`Top ${K} = [${h.join(", ")}] ✅`);
    setRunning(false);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Section title={`Top ${K} Largest Elements`} badge="Min-Heap Trick" badgeColor={T.accent3}>
          <div style={{ fontSize: 10, fontFamily: "monospace", color: T.muted, marginBottom: 6 }}>Array — process one by one:</div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12 }}>
            {arr.map((v, i) => {
              const isActive = processing === i;
              const inHeap = done && heap.includes(v);
              const c = inHeap ? T.accent3 : isActive ? T.accent : T.border;
              return (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{
                    width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
                    border: `2px solid ${c}`, borderRadius: 8, background: c + "22",
                    fontSize: 15, fontWeight: 800, fontFamily: "monospace", color: c === T.border ? T.text : c,
                    boxShadow: isActive ? `0 0 14px ${c}66` : "none", transition: "all .3s",
                  }}>{v}</div>
                  <div style={{ fontSize: 9, color: T.muted, fontFamily: "monospace", marginTop: 2 }}>[{i}]</div>
                </div>
              );
            })}
          </div>
          {/* Min heap visual */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontFamily: "monospace", color: T.accent3, marginBottom: 6 }}>Min-Heap (size ≤ {K}) — smallest at top:</div>
            <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
              {heap.length === 0
                ? <div style={{ color: T.muted, fontFamily: "monospace", fontSize: 12 }}>[ empty ]</div>
                : [...heap].map((v, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div style={{
                      width: 44, height: 44 + i * 4, display: "flex", alignItems: "center", justifyContent: "center",
                      border: `2px solid ${i === 0 ? T.accent2 : T.accent3}`,
                      borderRadius: 8, background: (i === 0 ? T.accent2 : T.accent3) + "22",
                      fontSize: 16, fontWeight: 900, fontFamily: "monospace",
                      color: i === 0 ? T.accent2 : T.accent3, transition: "all .3s",
                    }}>{v}</div>
                    <div style={{ fontSize: 9, color: i === 0 ? T.accent2 : T.muted, fontFamily: "monospace", marginTop: 2 }}>{i === 0 ? "min" : ""}</div>
                  </div>
                ))}
            </div>
          </div>
          {done && <div style={{ background: T.accent3 + "18", border: `1px solid ${T.accent3}`, borderRadius: 8, padding: "6px 12px", fontFamily: "monospace", fontSize: 12, color: T.accent3, marginBottom: 8 }}>🏆 Top {K}: [{heap.join(", ")}]</div>}
          <Btn onClick={run} disabled={running} color={T.accent3} full>▶ Animate</Btn>
        </Section>
        <Log entries={log} color={T.accent3} />
        <Section title="Identify This Pattern" badgeColor={T.accent3} badge="Triggers">
          {["\"Top K / K largest / K smallest\"", "K closest points to origin", "K most frequent elements", "Kth largest in stream", "Sort characters by frequency"].map(t => (
            <div key={t} style={{ fontSize: 11, color: T.muted, fontFamily: "monospace", padding: "2px 0" }}>▸ {t}</div>
          ))}
        </Section>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Section title="Python Code" flex>
          <CodePanel highlight={codeLine} code={`import heapq

def top_k_largest(arr, k):
    min_heap = []

    for num in arr:
        heapq.heappush(min_heap, num)
        if len(min_heap) > k:
            heapq.heappop(min_heap)  # remove smallest

    return list(min_heap)  # top k elements

# Easier: just use nlargest
import heapq
heapq.nlargest(k, arr)   # O(n log k)

# K most frequent elements:
from collections import Counter
def top_k_frequent(arr, k):
    count = Counter(arr)
    return heapq.nlargest(k, count.keys(),
                          key=count.get)

# Why min-heap for top-K LARGEST?
# Min-heap keeps the K largest seen so far.
# The top (min) is the threshold to beat.`} />
        </Section>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// PATTERN 8 — BFS / LEVEL ORDER TREE
// ══════════════════════════════════════════════════════════════════════
function BFSPattern() {
  const TREE = {
    val: 1,
    left: { val: 2, left: { val: 4, left: null, right: null }, right: { val: 5, left: null, right: null } },
    right: { val: 3, left: { val: 6, left: null, right: null }, right: { val: 7, left: null, right: null } }
  };
  const POSITIONS = { 1: [200, 30], 2: [110, 100], 3: [290, 100], 4: [60, 170], 5: [160, 170], 6: [240, 170], 7: [340, 170] };
  const EDGES = [[1,2],[1,3],[2,4],[2,5],[3,6],[3,7]];
  const [visited, setVisited] = useState([]);
  const [current, setCurrent] = useState(null);
  const [queueNodes, setQueueNodes] = useState([]);
  const [levels, setLevels] = useState([]);
  const [log, setLog] = useState([]);
  const [running, setRunning] = useState(false);
  const [codeLine, setCodeLine] = useState(-1);
  const addLog = m => setLog(p => [...p, m]);

  const run = async () => {
    setRunning(true); setLog([]); setVisited([]); setCurrent(null); setQueueNodes([]); setLevels([]);
    addLog("BFS Level Order: process nodes level by level using a queue");
    const queue = [TREE]; const result = []; const vis = [];
    setQueueNodes([TREE.val]); setCodeLine(1);
    await sleep(700);
    while (queue.length > 0) {
      const levelSize = queue.length;
      const levelVals = [];
      for (let i = 0; i < levelSize; i++) {
        const node = queue.shift(); setCurrent(node.val);
        vis.push(node.val); setVisited([...vis]);
        setQueueNodes(queue.map(n => n.val)); setCodeLine(4);
        addLog(`Dequeue ${node.val} (level ${result.length + 1})`);
        levelVals.push(node.val); await sleep(750);
        if (node.left) { queue.push(node.left); setQueueNodes(queue.map(n => n.val)); setCodeLine(6); addLog(`  → enqueue left child ${node.left.val}`); await sleep(350); }
        if (node.right) { queue.push(node.right); setQueueNodes(queue.map(n => n.val)); setCodeLine(7); addLog(`  → enqueue right child ${node.right.val}`); await sleep(350); }
      }
      result.push(levelVals); setLevels([...result]);
    }
    addLog(`Level order: ${result.map(l => `[${l}]`).join(" → ")} ✅`);
    setCurrent(null); setCodeLine(-1); setRunning(false);
  };

  const nodeColor = v => {
    if (v === current) return T.accent3;
    if (visited.includes(v)) return T.accent4;
    if (queueNodes.includes(v)) return T.blue;
    return T.border;
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Section title="BFS Level Order Traversal" badge="Queue-based" badgeColor={T.blue}>
          <div style={{ background: "#03030c", borderRadius: 10, border: `1px solid ${T.border}`, marginBottom: 10 }}>
            <svg width="100%" viewBox="0 0 400 210">
              {EDGES.map(([a, b]) => (
                <line key={`${a}-${b}`} x1={POSITIONS[a][0]} y1={POSITIONS[a][1]} x2={POSITIONS[b][0]} y2={POSITIONS[b][1]} stroke={T.dim} strokeWidth={1.5} />
              ))}
              {Object.entries(POSITIONS).map(([v, [x, y]]) => {
                const c = nodeColor(+v);
                return (
                  <g key={v}>
                    <circle cx={x} cy={y} r={22} fill={c + "33"} stroke={c} strokeWidth={2} style={{ transition: "all .4s" }} />
                    <text x={x} y={y + 5} textAnchor="middle" fill={c === T.border ? T.text : c} fontSize={14} fontWeight={800} fontFamily="monospace">{v}</text>
                  </g>
                );
              })}
            </svg>
          </div>
          {levels.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              {levels.map((level, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 10, color: T.muted, fontFamily: "monospace", minWidth: 50 }}>Level {i}:</span>
                  {level.map(v => <Badge key={v} color={T.accent4}>{v}</Badge>)}
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 10, fontFamily: "monospace" }}>
            {[["🟡", "Processing", T.accent3], ["🟢", "Visited", T.accent4], ["🔵", "In Queue", T.blue]].map(([ic, lb, c]) => (
              <span key={lb} style={{ color: c }}>{ic} {lb}</span>
            ))}
          </div>
          <Btn onClick={run} disabled={running} color={T.blue} full>▶ Animate Level Order</Btn>
        </Section>
        <Log entries={log} color={T.blue} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Section title="Python Code" flex>
          <CodePanel highlight={codeLine} code={`from collections import deque

def level_order(root):
    if not root: return []
    queue = deque([root]); result = []

    while queue:
        level_size = len(queue)
        level = []
        for _ in range(level_size):
            node = queue.popleft()    # dequeue
            level.append(node.val)
            if node.left:  queue.append(node.left)
            if node.right: queue.append(node.right)
        result.append(level)

    return result  # [[1],[2,3],[4,5,6,7]]

# Right side view (last of each level):
def right_side_view(root):
    result = []
    queue = deque([root] if root else [])
    while queue:
        level_size = len(queue)
        for i in range(level_size):
            node = queue.popleft()
            if i == level_size - 1:
                result.append(node.val)
            if node.left: queue.append(node.left)
            if node.right: queue.append(node.right)
    return result`} />
        </Section>
        <Section title="Identify This Pattern" badgeColor={T.accent3} badge="Triggers">
          {["Level order / zigzag traversal", "Minimum depth of tree", "Connect level nodes", "Shortest path in unweighted graph", "Rotting oranges / islands BFS"].map(t => (
            <div key={t} style={{ fontSize: 11, color: T.muted, fontFamily: "monospace", padding: "2px 0" }}>▸ {t}</div>
          ))}
        </Section>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// PATTERN 9 — DFS / BACKTRACKING
// ══════════════════════════════════════════════════════════════════════
function Backtracking() {
  const [subsets, setSubsets] = useState([]);
  const [current, setCurrent] = useState([]);
  const [log, setLog] = useState([]);
  const [running, setRunning] = useState(false);
  const [codeLine, setCodeLine] = useState(-1);
  const [activeStart, setActiveStart] = useState(-1);
  const nums = [1, 2, 3];
  const addLog = m => setLog(p => [...p, m]);

  const run = async () => {
    setRunning(true); setLog([]); setSubsets([]); setCurrent([]); setActiveStart(-1);
    addLog(`Generate all subsets of [${nums}] using backtracking`);
    const result = [];
    const dfs = async (start, curr) => {
      result.push([...curr]); setSubsets([...result]);
      setCurrent([...curr]); setCodeLine(2);
      addLog(`${"  ".repeat(curr.length)}Add [${curr}] → ${result.length} subsets so far`);
      await sleep(450);
      for (let i = start; i < nums.length; i++) {
        setActiveStart(i);
        curr.push(nums[i]); setCodeLine(4);
        addLog(`${"  ".repeat(curr.length-1)}Choose ${nums[i]} →`);
        await sleep(350);
        await dfs(i + 1, curr);
        curr.pop(); setCodeLine(6);
        addLog(`${"  ".repeat(curr.length)}Backtrack ← remove ${nums[i]}`);
        await sleep(300);
      }
    };
    await dfs(0, []);
    addLog(`All ${result.length} subsets found ✅`);
    setCurrent([]); setActiveStart(-1); setCodeLine(-1); setRunning(false);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Section title="Generate All Subsets (Backtracking)" badge="DFS Tree" badgeColor={T.pink}>
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            {nums.map((v, i) => (
              <div key={i} style={{
                width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center",
                border: `2px solid ${current.includes(v) ? T.pink : activeStart === i ? T.accent3 : T.border}`,
                borderRadius: 8, background: current.includes(v) ? T.pink + "22" : T.card,
                fontSize: 18, fontWeight: 800, fontFamily: "monospace",
                color: current.includes(v) ? T.pink : T.text, transition: "all .3s",
              }}>{v}</div>
            ))}
            <div style={{ display: "flex", alignItems: "center", marginLeft: 8, fontFamily: "monospace", fontSize: 12 }}>
              <span style={{ color: T.muted }}>Current: </span>
              <span style={{ color: T.pink, marginLeft: 6 }}>[{current.join(", ")}]</span>
            </div>
          </div>
          {/* Subsets grid */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, minHeight: 80, marginBottom: 10 }}>
            {subsets.map((s, i) => (
              <div key={i} style={{
                background: T.pink + "18", border: `1px solid ${T.pink}`,
                borderRadius: 6, padding: "3px 8px", fontFamily: "monospace", fontSize: 11,
                color: T.pink, animation: "popIn .3s ease",
              }}>[{s.join(",")}]</div>
            ))}
            {subsets.length === 0 && <div style={{ color: T.muted, fontFamily: "monospace", fontSize: 12 }}>Subsets appear here...</div>}
          </div>
          <div style={{ fontSize: 10, fontFamily: "monospace", color: T.muted, marginBottom: 8 }}>
            Total: {subsets.length} / 8 subsets (2³ = 8)
          </div>
          <Btn onClick={run} disabled={running} color={T.pink} full>▶ Animate Backtracking</Btn>
        </Section>
        <Log entries={log} color={T.pink} />
        <Section title="Identify This Pattern" badgeColor={T.accent3} badge="Triggers">
          {["Generate all subsets/permutations", "Combination sum", "N-Queens, Sudoku solver", "Word search in grid", "Path finding with constraints"].map(t => (
            <div key={t} style={{ fontSize: 11, color: T.muted, fontFamily: "monospace", padding: "2px 0" }}>▸ {t}</div>
          ))}
        </Section>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Section title="Python Code" flex>
          <CodePanel highlight={codeLine} code={`def subsets(nums):
    result = []

    def backtrack(start, current):
        result.append(current[:])  # add snapshot

        for i in range(start, len(nums)):
            current.append(nums[i])   # CHOOSE
            backtrack(i + 1, current) # EXPLORE
            current.pop()             # UN-CHOOSE ←backtrack

    backtrack(0, [])
    return result

# Template for ALL backtracking:
def backtrack(state, choices):
    if is_solution(state):
        result.append(state[:])
        return
    for choice in choices:
        make_choice(state, choice)
        backtrack(state, remaining_choices)
        undo_choice(state, choice)  # KEY STEP!

# Permutations (order matters):
def permutations(nums):
    result = []
    def bt(curr, used):
        if len(curr) == len(nums):
            result.append(curr[:]); return
        for i,n in enumerate(nums):
            if not used[i]:
                used[i]=True; curr.append(n)
                bt(curr, used)
                used[i]=False; curr.pop()
    bt([], [False]*len(nums))
    return result`} />
        </Section>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// PATTERN 10 — DYNAMIC PROGRAMMING
// ══════════════════════════════════════════════════════════════════════
function DynamicProgramming() {
  const weights = [2, 3, 4, 5];
  const values  = [3, 4, 5, 6];
  const capacity = 5;
  const [dp, setDp] = useState([]);
  const [activeCell, setActiveCell] = useState(null);
  const [log, setLog] = useState([]);
  const [running, setRunning] = useState(false);
  const [codeLine, setCodeLine] = useState(-1);
  const addLog = m => setLog(p => [...p, m]);

  const run = async () => {
    setRunning(true); setLog([]); setDp([]); setActiveCell(null);
    addLog(`0/1 Knapsack: capacity=${capacity}, ${weights.length} items`);
    const n = weights.length;
    const table = Array(n+1).fill(null).map(() => Array(capacity+1).fill(0));
    setDp(table.map(r => [...r])); setCodeLine(1);
    await sleep(600);
    for (let i = 1; i <= n; i++) {
      for (let w = 0; w <= capacity; w++) {
        setActiveCell([i, w]); setCodeLine(4);
        addLog(`dp[${i}][${w}]: item${i}(wt=${weights[i-1]}, val=${values[i-1]})`);
        await sleep(120);
        if (weights[i-1] <= w) {
          table[i][w] = Math.max(table[i-1][w], values[i-1] + table[i-1][w - weights[i-1]]);
          setCodeLine(5);
        } else {
          table[i][w] = table[i-1][w];
          setCodeLine(7);
        }
        setDp(table.map(r => [...r]));
      }
    }
    addLog(`Max value = dp[${n}][${capacity}] = ${table[n][capacity]} ✅`);
    setActiveCell(null); setCodeLine(-1); setRunning(false);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Section title="0/1 Knapsack (DP Table)" badge="Bottom-Up" badgeColor={T.orange}>
          <div style={{ fontSize: 10, fontFamily: "monospace", color: T.muted, marginBottom: 8 }}>
            Items: weights=[2,3,4,5] values=[3,4,5,6] capacity=5
          </div>
          {dp.length > 0 && (
            <div style={{ overflowX: "auto", marginBottom: 10 }}>
              <table style={{ borderCollapse: "collapse", fontFamily: "monospace", fontSize: 11 }}>
                <thead>
                  <tr>
                    <th style={{ padding: "4px 8px", color: T.muted, textAlign: "center" }}>i\w</th>
                    {Array.from({length: capacity+1}, (_,w) => (
                      <th key={w} style={{ padding: "4px 8px", color: T.blue, textAlign: "center" }}>{w}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dp.map((row, i) => (
                    <tr key={i}>
                      <td style={{ padding: "4px 8px", color: T.accent3 }}>{i}</td>
                      {row.map((val, w) => {
                        const isActive = activeCell && activeCell[0] === i && activeCell[1] === w;
                        const isResult = i === dp.length-1 && w === capacity;
                        const c = isResult ? T.orange : isActive ? T.accent : T.border;
                        return (
                          <td key={w} style={{ padding: "3px 6px", textAlign: "center" }}>
                            <div style={{
                              width: 30, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
                              border: `1.5px solid ${c}`, borderRadius: 5, background: c + "22",
                              color: isResult ? T.orange : isActive ? T.accent : val > 0 ? T.text : T.muted,
                              fontWeight: isResult ? 900 : 700, transition: "all .15s",
                              boxShadow: isResult ? `0 0 8px ${T.orange}66` : "none",
                            }}>{val}</div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {dp.length > 0 && dp[dp.length-1] && (
            <div style={{ fontSize: 12, fontFamily: "monospace", color: T.orange, marginBottom: 8 }}>
              Answer: dp[{weights.length}][{capacity}] = {dp[weights.length]?.[capacity] ?? "..."}
            </div>
          )}
          <Btn onClick={run} disabled={running} color={T.orange} full>▶ Build DP Table</Btn>
        </Section>
        <Log entries={log} color={T.orange} />
        <Section title="Identify This Pattern" badgeColor={T.accent3} badge="Triggers">
          {["Optimization (max/min)", "Count ways to do something", "\"Can you reach...\" overlapping subproblems", "Fibonacci / climbing stairs", "Longest common subsequence"].map(t => (
            <div key={t} style={{ fontSize: 11, color: T.muted, fontFamily: "monospace", padding: "2px 0" }}>▸ {t}</div>
          ))}
        </Section>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Section title="Python Code" flex>
          <CodePanel highlight={codeLine} code={`def knapsack(weights, values, capacity):
    n = len(weights)
    dp = [[0]*(capacity+1) for _ in range(n+1)]

    for i in range(1, n+1):
        for w in range(capacity+1):
            if weights[i-1] <= w:
                dp[i][w] = max(
                    dp[i-1][w],            # skip item
                    values[i-1] + dp[i-1][w-weights[i-1]] # take
                )
            else:
                dp[i][w] = dp[i-1][w]  # can't take

    return dp[n][capacity]

# Coin change (min coins):
def coin_change(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for coin in coins:
        for x in range(coin, amount + 1):
            dp[x] = min(dp[x], dp[x - coin] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1`} />
        </Section>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// PATTERN 11 — GREEDY
// ══════════════════════════════════════════════════════════════════════
function Greedy() {
  const activities = [{s:1,e:4},{s:3,e:5},{s:0,e:6},{s:5,e:7},{s:3,e:9},{s:5,e:9},{s:6,e:10},{s:8,e:11},{s:8,e:12},{s:2,e:14}];
  const [selected, setSelected] = useState([]);
  const [current, setCurrent] = useState(-1);
  const [log, setLog] = useState([]);
  const [running, setRunning] = useState(false);
  const [codeLine, setCodeLine] = useState(-1);
  const addLog = m => setLog(p => [...p, m]);
  const toX = v => (v / 15) * 260;

  const run = async () => {
    setRunning(true); setLog([]); setSelected([]); setCurrent(-1);
    addLog("Activity Selection: greedily pick earliest-ending activity");
    const sorted = [...activities].sort((a, b) => a.e - b.e);
    setCodeLine(1); await sleep(600);
    const sel = [];
    let lastEnd = 0;
    for (let i = 0; i < sorted.length; i++) {
      const act = sorted[i];
      setCurrent(activities.indexOf(act)); setCodeLine(3);
      addLog(`Activity [${act.s}-${act.e}]: starts at ${act.s}, last end=${lastEnd}`);
      await sleep(800);
      if (act.s >= lastEnd) {
        sel.push(act); setSelected([...sel]); lastEnd = act.e;
        setCodeLine(4); addLog(`  ✅ SELECTED! Ends at ${act.e}`);
      } else {
        setCodeLine(5); addLog(`  ❌ Skipped — conflicts (starts ${act.s} < lastEnd ${lastEnd})`);
      }
      await sleep(500);
    }
    addLog(`Selected ${sel.length} activities ✅`);
    setCurrent(-1); setCodeLine(-1); setRunning(false);
  };

  const colors = [T.accent, T.blue, T.purple, T.accent2, T.accent3, T.orange, T.accent4, T.pink, T.accent, T.blue];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Section title="Activity Selection (Greedy)" badge="Earliest End First" badgeColor={T.accent4}>
          <div style={{ position: "relative", marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontFamily: "monospace", color: T.muted, marginBottom: 6 }}>Activities (sorted by end time):</div>
            <div style={{ position: "relative", height: activities.length * 22 + 10 }}>
              {[...activities].sort((a,b)=>a.e-b.e).map((act, i) => {
                const origIdx = activities.indexOf(act);
                const isSel = selected.includes(act);
                const isCur = current === origIdx;
                const c = isSel ? T.accent4 : isCur ? T.accent3 : colors[i % colors.length] + "66";
                return (
                  <div key={i} style={{
                    position: "absolute", left: toX(act.s), width: Math.max(toX(act.e - act.s), 20),
                    top: i * 22, height: 18,
                    background: c + (isSel ? "33" : "22"), border: `1.5px solid ${c}`,
                    borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, fontFamily: "monospace", color: isSel ? T.accent4 : isCur ? T.accent3 : T.muted,
                    fontWeight: isSel ? 900 : 400,
                    boxShadow: isSel ? `0 0 8px ${T.accent4}66` : isCur ? `0 0 8px ${T.accent3}44` : "none",
                    transition: "all .3s",
                  }}>{act.s}-{act.e}</div>
                );
              })}
              <div style={{ position: "absolute", bottom: -12, left: 0, right: 0, height: 1, background: T.border }} />
              {[0,5,10,15].map(v => (
                <div key={v} style={{ position: "absolute", bottom: -22, left: toX(v), fontSize: 8, color: T.muted, fontFamily: "monospace", transform: "translateX(-50%)" }}>{v}</div>
              ))}
            </div>
          </div>
          {selected.length > 0 && (
            <div style={{ fontFamily: "monospace", fontSize: 11, color: T.accent4, marginBottom: 8 }}>
              Selected: {selected.map(a => `[${a.s}-${a.e}]`).join(" → ")}
            </div>
          )}
          <Btn onClick={run} disabled={running} color={T.accent4} full>▶ Animate Greedy</Btn>
        </Section>
        <Log entries={log} color={T.accent4} />
        <Section title="Identify This Pattern" badgeColor={T.accent3} badge="Triggers">
          {["Scheduling / meeting rooms", "Jump game (can you reach end?)", "Minimum platforms needed", "Assign cookies to children", "Gas station / candy problem"].map(t => (
            <div key={t} style={{ fontSize: 11, color: T.muted, fontFamily: "monospace", padding: "2px 0" }}>▸ {t}</div>
          ))}
        </Section>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Section title="Python Code" flex>
          <CodePanel highlight={codeLine} code={`def activity_selection(activities):
    activities.sort(key=lambda x: x[1])  # sort by end
    selected = [activities[0]]
    last_end = activities[0][1]

    for start, end in activities[1:]:
        if start >= last_end:    # no conflict
            selected.append((start, end))
            last_end = end

    return selected

# Jump Game (can reach last index?):
def can_jump(nums):
    max_reach = 0
    for i, n in enumerate(nums):
        if i > max_reach: return False
        max_reach = max(max_reach, i + n)
    return True

# Greedy rule: "locally optimal" choice
# leads to "globally optimal" solution.
# Proof: Exchange argument — if we swap
# any selected activity for a skipped one,
# we don't improve the result.`} />
        </Section>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// PATTERN 12 — MONOTONIC STACK
// ══════════════════════════════════════════════════════════════════════
function MonotonicStack() {
  const arr = [2, 1, 5, 3, 6, 4, 8];
  const [stack, setStack] = useState([]);
  const [result, setResult] = useState(Array(arr.length).fill(-1));
  const [processing, setProcessing] = useState(-1);
  const [log, setLog] = useState([]);
  const [running, setRunning] = useState(false);
  const [codeLine, setCodeLine] = useState(-1);
  const addLog = m => setLog(p => [...p, m]);

  const run = async () => {
    setRunning(true); setLog([]); setStack([]); setResult(Array(arr.length).fill(-1)); setProcessing(-1);
    addLog("Next Greater Element: monotonic decreasing stack");
    const st = []; const res = Array(arr.length).fill(-1);
    for (let i = 0; i < arr.length; i++) {
      setProcessing(i); setCodeLine(2);
      addLog(`Process arr[${i}]=${arr[i]}`);
      await sleep(700);
      while (st.length > 0 && arr[st[st.length-1]] < arr[i]) {
        const idx = st.pop(); setStack([...st]);
        res[idx] = arr[i]; setResult([...res]);
        setCodeLine(4); addLog(`  arr[${idx}]=${arr[idx]} < ${arr[i]} → NGE of ${arr[idx]} is ${arr[i]} ✅`);
        await sleep(500);
      }
      st.push(i); setStack([...st]); setCodeLine(5);
      addLog(`  Push index ${i} onto stack → [${st.map(x=>arr[x]).join(",")}]`);
      await sleep(400);
    }
    addLog(`NGE Result: [${res.join(", ")}] (-1 = none) ✅`);
    setProcessing(-1); setCodeLine(-1); setRunning(false);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Section title="Next Greater Element (Monotonic Stack)" badge="Stack trick" badgeColor={T.accent}>
          <div style={{ fontSize: 10, fontFamily: "monospace", color: T.muted, marginBottom: 6 }}>Array:</div>
          <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
            {arr.map((v, i) => {
              const inStack = stack.includes(i);
              const isActive = processing === i;
              const c = isActive ? T.accent3 : inStack ? T.accent : T.border;
              return (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ height: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {result[i] !== -1 && <div style={{ fontSize: 8, color: T.accent4, fontFamily: "monospace" }}>→{result[i]}</div>}
                    {result[i] === -1 && processing > i && <div style={{ fontSize: 8, color: T.accent2, fontFamily: "monospace" }}>-1</div>}
                  </div>
                  <div style={{
                    width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
                    border: `2px solid ${c}`, borderRadius: 8, background: c + "22",
                    fontSize: 15, fontWeight: 800, fontFamily: "monospace", color: c === T.border ? T.text : c,
                    boxShadow: isActive ? `0 0 14px ${c}66` : "none", transition: "all .3s",
                  }}>{v}</div>
                  <div style={{ fontSize: 9, color: T.muted, fontFamily: "monospace", marginTop: 2 }}>[{i}]</div>
                </div>
              );
            })}
          </div>
          {/* Stack display */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, fontFamily: "monospace", color: T.accent, marginBottom: 6 }}>Stack (stores indices, shows values):</div>
            <div style={{ display: "flex", gap: 4, alignItems: "flex-end" }}>
              {stack.length === 0
                ? <div style={{ color: T.muted, fontFamily: "monospace", fontSize: 11 }}>[ empty ]</div>
                : stack.map((idx, i) => (
                  <div key={idx} style={{
                    width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
                    border: `2px solid ${T.accent}`, borderRadius: 8, background: T.accent + "18",
                    fontSize: 14, fontWeight: 800, fontFamily: "monospace", color: T.accent, transition: "all .3s",
                  }}>{arr[idx]}</div>
                ))}
              {stack.length > 0 && <div style={{ fontSize: 9, color: T.muted, fontFamily: "monospace" }}>↑ top</div>}
            </div>
          </div>
          {result.some(r => r !== -1) && (
            <div style={{ fontFamily: "monospace", fontSize: 11, color: T.accent4, marginBottom: 8 }}>
              NGE: [{result.join(", ")}]
            </div>
          )}
          <Btn onClick={run} disabled={running} color={T.accent} full>▶ Animate</Btn>
        </Section>
        <Log entries={log} color={T.accent} />
        <Section title="Identify This Pattern" badgeColor={T.accent3} badge="Triggers">
          {["Next greater/smaller element", "Daily temperatures problem", "Largest rectangle in histogram", "Trapping rain water", "Stock span problem"].map(t => (
            <div key={t} style={{ fontSize: 11, color: T.muted, fontFamily: "monospace", padding: "2px 0" }}>▸ {t}</div>
          ))}
        </Section>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Section title="Python Code" flex>
          <CodePanel highlight={codeLine} code={`def next_greater_element(arr):
    stack = []; result = [-1] * len(arr)

    for i in range(len(arr)):
        # Pop elements smaller than current
        while stack and arr[stack[-1]] < arr[i]:
            idx = stack.pop()
            result[idx] = arr[i]  # current is NGE
        stack.append(i)

    return result  # remaining stack → -1

# Daily Temperatures (days until warmer):
def daily_temperatures(temps):
    stack = []; result = [0] * len(temps)
    for i, t in enumerate(temps):
        while stack and temps[stack[-1]] < t:
            j = stack.pop()
            result[j] = i - j  # days to wait
        stack.append(i)
    return result

# Largest rectangle in histogram:
def largest_rect(heights):
    stack = []; max_area = 0
    heights.append(0)  # sentinel
    for i, h in enumerate(heights):
        while stack and heights[stack[-1]] > h:
            height = heights[stack.pop()]
            width = i if not stack else i-stack[-1]-1
            max_area = max(max_area, height*width)
        stack.append(i)
    return max_area`} />
        </Section>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════════
const PATTERNS = [
  { id:"sliding",    label:"Sliding Window",         icon:"⧉",  badge:"Fixed/Variable",    color:T.accent,  comp:SlidingWindow,       difficulty:"Easy" },
  { id:"twoptr",     label:"Two Pointers",            icon:"⇌",  badge:"Sorted Array",      color:T.blue,    comp:TwoPointers,         difficulty:"Easy" },
  { id:"fastslow",   label:"Fast & Slow Pointers",    icon:"⏩", badge:"Cycle Detection",   color:T.purple,  comp:FastSlow,            difficulty:"Medium" },
  { id:"intervals",  label:"Merge Intervals",         icon:"⊞",  badge:"Overlap",           color:T.orange,  comp:MergeIntervals,      difficulty:"Medium" },
  { id:"prefix",     label:"Prefix Sum",              icon:"∑",  badge:"Range Queries",     color:T.accent4, comp:PrefixSum,           difficulty:"Easy" },
  { id:"binsearch",  label:"Binary Search Variants",  icon:"⌕",  badge:"Modified BS",       color:T.accent2, comp:BinarySearchVariants,difficulty:"Medium" },
  { id:"topk",       label:"Top K Elements",          icon:"⬆K", badge:"Heap",              color:T.accent3, comp:TopKElements,        difficulty:"Medium" },
  { id:"bfs",        label:"BFS / Level Order",       icon:"◎",  badge:"Queue",             color:T.blue,    comp:BFSPattern,          difficulty:"Medium" },
  { id:"backtrack",  label:"Backtracking / DFS",      icon:"↩",  badge:"Explore All",       color:T.pink,    comp:Backtracking,        difficulty:"Hard" },
  { id:"dp",         label:"Dynamic Programming",     icon:"◈",  badge:"Memoization",       color:T.orange,  comp:DynamicProgramming,  difficulty:"Hard" },
  { id:"greedy",     label:"Greedy Algorithms",       icon:"★",  badge:"Local Optimal",     color:T.accent4, comp:Greedy,              difficulty:"Medium" },
  { id:"monotonic",  label:"Monotonic Stack",         icon:"▲",  badge:"NGE / Histogram",   color:T.accent,  comp:MonotonicStack,      difficulty:"Hard" },
];

const DIFF_COLOR = { Easy: T.accent4, Medium: T.accent3, Hard: T.accent2 };

export default function App() {
  const [active, setActive] = useState("sliding");
  const [sideOpen, setSideOpen] = useState(true);
  const topic = PATTERNS.find(p => p.id === active);
  const Comp = topic?.comp;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Segoe UI', system-ui, sans-serif", display: "flex" }}>
      <style>{`
        @keyframes popIn { from{transform:scale(0) translateY(-8px);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes slideIn { from{transform:translateX(-20px);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes pulseGlow { 0%,100%{box-shadow:0 0 0 0 rgba(0,255,204,.3)} 50%{box-shadow:0 0 0 6px rgba(0,255,204,0)} }
        * { box-sizing: border-box; }
        button:hover:not(:disabled) { filter: brightness(1.2); transform: translateY(-1px); }
        input:focus { outline: none; border-color: ${T.accent} !important; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: ${T.bg}; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 3px; }
      `}</style>

      {/* ── SIDEBAR ── */}
      <div style={{ width: sideOpen ? 230 : 52, background: T.panel, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", transition: "width .3s", flexShrink: 0, overflow: "hidden" }}>
        {/* Logo */}
        <div style={{ padding: "14px 10px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 10, minHeight: 56 }}>
          <div style={{ width: 30, height: 30, background: "linear-gradient(135deg,#00ffcc,#f72585)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 900, flexShrink: 0 }}>P</div>
          {sideOpen && (
            <div>
              <div style={{ fontWeight: 900, fontSize: 13, background: "linear-gradient(90deg,#00ffcc,#f72585)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Pattern Lab</div>
              <div style={{ fontSize: 9, color: T.muted, fontFamily: "monospace" }}>12 Patterns · Python</div>
            </div>
          )}
          <button onClick={() => setSideOpen(p => !p)} style={{ marginLeft: "auto", background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 14, flexShrink: 0 }}>{sideOpen ? "◀" : "▶"}</button>
        </div>

        {/* Nav */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 6px" }}>
          {PATTERNS.map((p, i) => (
            <button key={p.id} onClick={() => setActive(p.id)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "7px 8px",
              background: active === p.id ? p.color + "14" : "transparent",
              border: `1px solid ${active === p.id ? p.color : "transparent"}`,
              borderRadius: 8, cursor: "pointer", marginBottom: 3, textAlign: "left",
              animation: `slideIn .25s ease ${i * 0.025}s both`,
            }}>
              <div style={{
                width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
                background: active === p.id ? p.color + "28" : T.card,
                border: `1px solid ${active === p.id ? p.color : T.border}`,
                borderRadius: 7, fontSize: 12, flexShrink: 0, color: active === p.id ? p.color : T.muted, fontWeight: 700,
              }}>{i + 1}</div>
              {sideOpen && (
                <div style={{ overflow: "hidden" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: active === p.id ? p.color : T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.label}</div>
                  <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                    <span style={{ fontSize: 9, color: T.muted, fontFamily: "monospace" }}>{p.badge}</span>
                    <span style={{ fontSize: 8, color: DIFF_COLOR[p.difficulty], background: DIFF_COLOR[p.difficulty] + "18", padding: "0 4px", borderRadius: 3, fontFamily: "monospace" }}>{p.difficulty}</span>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>

        {sideOpen && <div style={{ padding: "8px 12px", borderTop: `1px solid ${T.border}`, fontSize: 9, color: T.muted, fontFamily: "monospace" }}>
          <div style={{ color: T.accent4 }}>● Easy</div><div style={{ color: T.accent3 }}>● Medium</div><div style={{ color: T.accent2 }}>● Hard</div>
        </div>}
      </div>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, background: topic.color + "22", border: `2px solid ${topic.color}`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: topic.color }}>
            {PATTERNS.findIndex(p => p.id === active) + 1}
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 20, color: topic.color }}>{topic.label}</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Badge color={topic.color}>{topic.badge}</Badge>
              <Badge color={DIFF_COLOR[topic.difficulty]}>{topic.difficulty}</Badge>
              <span style={{ fontSize: 11, color: T.muted, fontFamily: "monospace" }}>Python · Interactive</span>
            </div>
          </div>
          {/* Progress dots */}
          <div style={{ marginLeft: "auto", display: "flex", gap: 5, flexWrap: "wrap", maxWidth: 180 }}>
            {PATTERNS.map(p => (
              <button key={p.id} onClick={() => setActive(p.id)} title={p.label} style={{
                width: 8, height: 8, borderRadius: "50%", border: "none", cursor: "pointer",
                background: active === p.id ? p.color : T.border, padding: 0, transition: "all .2s",
              }} />
            ))}
          </div>
        </div>

        {Comp && <Comp key={active} />}
      </div>
    </div>
  );
}