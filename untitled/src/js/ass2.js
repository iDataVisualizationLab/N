procedure explore(G,v)
visited[v] = true
for each edge (v,u) in E:
if not visited[u]:
explore(G,u)
