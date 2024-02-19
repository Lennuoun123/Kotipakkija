import random
import string

randmostring = ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(20))
print(randmostring)


i = 0
suvaline = ''
while(i < 30):
    suvaline += random.choice(string.ascii_uppercase + string.digits)
    i += 1
print(suvaline)


