@echo off
aws ssm send-command --instance-ids i-071a838ae09180a40 --document-name AWS-RunShellScript --parameters commands="systemctl status sshd --no-pager" --region us-east-1 --output json > ssm-result.json 2>&1
type ssm-result.json
