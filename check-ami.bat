@echo off
aws ec2 describe-images --owners amazon --filters Name=name,Values=al2023-ami-2023*-kernel-*-x86_64 Name=state,Values=available --region us-east-1 --query "sort_by(Images, &CreationDate)[-1].{AMI:ImageId,Name:Name}" --output json 2>&1
