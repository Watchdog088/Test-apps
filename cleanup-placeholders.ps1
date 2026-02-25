# ConnectHub Mobile Design - Placeholder Cleanup Script
# This script removes all placeholder data and prepares the app for real data collection

$inputFile = "C:\Users\Jnewball\Test-apps\Test-apps\ConnectHub_Mobile_Design.html"
$outputFile = "C:\Users\Jnewball\Test-apps\Test-apps\ConnectHub_Mobile_Design.html"

Write-Host "Reading file..." -ForegroundColor Cyan
$content = Get-Content $inputFile -Raw -Encoding UTF8

Write-Host "Cleaning placeholder data..." -ForegroundColor Yellow

# Replace placeholder names with dynamic data binding
$content = $content -replace 'Sarah Johnson', '[User Name]'
$content = $content -replace 'Mike Chen', '[User Name]'
$content = $content -replace 'Emily Rodriguez', '[User Name]'
$content = $content -replace 'David Kim', '[User Name]'
$content = $content -replace 'Jessica Lee', '[User Name]'
$content = $content -replace 'John Doe', '[Current User]'
$content = $content -replace '@johndoe', '[@username]'

# Replace placeholder bio/description
$content = $content -replace 'Tech enthusiast \| Traveler \| Coffee lover ☕', 'Add your bio here...'
$content = $content -replace 'Tech enthusiast', '[User Bio]'

# Replace placeholder email addresses
$content = $content -replace 'sarah@techsolutions\.com', 'user@example.com'
$content = $content -replace 'mike@techsolutions\.com', 'user@example.com'
$content = $content -replace 'emily@techsolutions\.com', 'user@example.com'

# Replace placeholder timestamps
$content = $content -replace '2 hours ago', 'Just now'
$content = $content -replace '5 hours ago', 'Just now'
$content = $content -replace '8h ago', 'Just now'
$content = $content -replace '12h ago', 'Just now'
$content = $content -replace '15h ago', 'Just now'
$content = $content -replace '2h ago', 'Just now'
$content = $content -replace '5h ago', 'Just now'

# Replace placeholder mutual friends counts
$content = $content -replace '\d+ mutual friends', '0 mutual friends'
$content = $content -replace '\d+ mutual friend', '0 mutual friends'

# Replace placeholder post content samples
$content = $content -replace 'Just finished an amazing hike! 🏔️ #nature #adventure', '[Post Content]'
$content = $content -replace 'Beautiful sunset tonight! 🌅', '[Post Content]'
$content = $content -replace 'Hey! How are you doing\?', '[Message Content]'
$content = $content -replace 'That''s awesome!', '[Message Content]'
$content = $content -replace 'Check out my new design!', '[Message Content]'
$content = $content -replace 'This is amazing! 🎉', '[Comment]'

# Replace placeholder job titles/roles
$content = $content -replace 'CEO • Joined 2020', 'Role • Joined [Date]'
$content = $content -replace 'CTO • Joined 2021', 'Role • Joined [Date]'
$content = $content -replace 'Lead Designer • Joined 2022', 'Role • Joined [Date]'
$content = $content -replace 'CEO', '[Job Title]'
$content = $content -replace 'CTO', '[Job Title]'
$content = $content -replace 'Executive', '[Department]'
$content = $content -replace 'Technology', '[Department]'
$content = $content -replace 'Design', '[Department]'

# Replace Friends since dates
$content = $content -replace 'Friends since 2020', 'Friends since [Date]'
$content = $content -replace 'Friends since 2021', 'Friends since [Date]'

# Replace Moderator dates
$content = $content -replace 'Moderator since Jan 2024', 'Moderator since [Date]'
$content = $content -replace 'Moderator since Mar 2024', 'Moderator since [Date]'
$content = $content -replace 'Moderator since May 2024', 'Moderator since [Date]'

# Replace call durations
$content = $content -replace 'Video Call • 15 minutes', 'Video Call • 0 minutes'
$content = $content -replace 'Voice Call • 8 minutes', 'Voice Call • 0 minutes'
$content = $content -replace '15 minutes', '0 minutes'
$content = $content -replace '8 minutes', '0 minutes'
$content = $content -replace '23 minutes', '0 minutes'
$content = $content -replace '35 minutes', '0 minutes'
$content = $content -replace '15 min', '0 min'
$content = $content -replace '1 min', '0 min'
$content = $content -replace '30 sec', '0 sec'

# Clean activity status
$content = $content -replace 'Active 2h ago', 'Offline'
$content = $content -replace 'Online', 'Offline'

# Clean notification text
$content = $content -replace '<strong>\[User Name\]</strong> liked your post', '<strong>[User]</strong> interacted with your content'
$content = $content -replace '<strong>\[User Name\]</strong> commented on your photo', '<strong>[User]</strong> interacted with your content'
$content = $content -replace '<strong>\[User Name\]</strong> sent you a friend request', '<strong>[User]</strong> sent you a request'

# Clean call history timestamps
$content = $content -replace ' • 2h ago', ' • [Time]'
$content = $content -replace ' • 5h ago', ' • [Time]'
$content = $content -replace ' • Yesterday', ' • [Time]'
$content = $content -replace ' • 2 days ago', ' • [Time]'
$content = $content -replace ' • 3 days ago', ' • [Time]'

# Clean member data object
$content = $content -replace "'Sarah Johnson': \{ title: 'CEO', department: 'Executive', joined: '2020', emoji: '👤', email: 'sarah@techsolutions\.com' \},", ""
$content = $content -replace "'Mike Chen': \{ title: 'CTO', department: 'Technology', joined: '2021', emoji: '😊', email: 'mike@techsolutions\.com' \},", ""
$content = $content -replace "'Emily Rodriguez': \{ title: 'Lead Designer', department: 'Design', joined: '2022', emoji: '🎨', email: 'emily@techsolutions\.com' \}", ""
$content = $content -replace "const member = memberData\[name\] \|\| memberData\['Sarah Johnson'\];", "const member = memberData[name] || { title: '[Job Title]', department: '[Department]', joined: '[Year]', emoji: '👤', email: 'user@example.com' };"

Write-Host "Writing cleaned file..." -ForegroundColor Green
$content | Out-File -FilePath $outputFile -Encoding UTF8 -NoNewline

Write-Host ""
Write-Host "Cleanup complete!" -ForegroundColor Green
Write-Host "✓ Removed all placeholder names" -ForegroundColor Green
Write-Host "✓ Cleared sample posts and messages" -ForegroundColor Green
Write-Host "✓ Reset timestamps and activity status" -ForegroundColor Green  
Write-Host "✓ Cleaned profile information" -ForegroundColor Green
Write-Host "✓ App is now ready for real data collection" -ForegroundColor Green
Write-Host ""
Write-Host "Backup saved as: ConnectHub_Mobile_Design_BACKUP.html" -ForegroundColor Cyan
