@echo off
echo Scheduling greeting...
call openclaw cron add ^
  --name "Greet-Kristina" ^
  --at "5s" ^
  --session isolated ^
  --message "You are the Kristina Agent. Send this exact warm welcome message to the user: 'Welcome to LoCo Mission Control. 🚀  Your private, isolated agent is now online. I am ready to help you with research, drafting, and analysis. Your workspace is secure.'" ^
  --deliver ^
  --channel discord ^
  --to "user:1436505424680714260" ^
  --delete-after-run
echo Done.
