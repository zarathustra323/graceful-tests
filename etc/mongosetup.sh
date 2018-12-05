
#!/bin/bash
# echo "Waiting for startup.."
# until curl http://mongodb01:28017/serverStatus\?text\=1 2>&1 | grep uptime | head -1; do
#   printf '.'
#   sleep 1
# done

# echo curl http://mongodb01:28017/serverStatus\?text\=1 2>&1 | grep uptime | head -1
# echo "Started.."

# sleep 10

echo SETUP.sh time now: `date +"%T" `
mongo --host mongodb01:27017 <<EOF
  var cfg = {
    "_id": "rs0",
    "version": 1,
    "members": [
      {
        "_id": 1,
        "host": "mongodb01:27017",
        "priority": 2
      },
      {
        "_id": 2,
        "host": "mongodb02:27017",
        "priority": 1
      },
      {
        "_id": 3,
        "host": "mongodb03:27017",
        "priority": 1
      }
    ]
  };
  rs.initiate(cfg, { force: true });
EOF

# tail -f /dev/null
